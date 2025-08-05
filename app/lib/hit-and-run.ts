import { prisma } from '@/app/lib/prisma';

// Configuración del sistema de hit and run
type HitAndRunConfig = {
  requiredSeedingMinutes: number;
  hitAndRunThreshold: number;
};

// Obtener configuración del sistema de hit and run
export async function getHitAndRunConfig(): Promise<HitAndRunConfig> {
  const requiredSeedingConfig = await prisma.configuration.findUnique({ 
    where: { key: 'REQUIRED_SEEDING_MINUTES' } 
  });
  
  const thresholdConfig = await prisma.configuration.findUnique({ 
    where: { key: 'HIT_AND_RUN_THRESHOLD' } 
  });

  return {
    requiredSeedingMinutes: requiredSeedingConfig ? parseInt(requiredSeedingConfig.value, 10) : 4320, // 72 horas por defecto
    hitAndRunThreshold: thresholdConfig ? parseInt(thresholdConfig.value, 10) : 5
  };
}

// Verificar y actualizar hit and run basado en tiempo de seeding
export async function checkAndUpdateHitAndRun(userId: string): Promise<{ 
  allowed: boolean; 
  failureReason?: string; 
  count: number 
}> {
  const config = await getHitAndRunConfig();
  
  // Contar hit and runs activos del usuario
  const hitAndRunCount = await prisma.hitAndRun.count({
    where: {
      userId,
      isHitAndRun: true
    }
  });

  console.log(`[HIT_AND_RUN] User ${userId} has ${hitAndRunCount} hit and runs, threshold: ${config.hitAndRunThreshold}`);

  if (hitAndRunCount >= config.hitAndRunThreshold) {
    return { 
      allowed: false, 
      failureReason: `You have committed ${config.hitAndRunThreshold} or more hit and runs.`, 
      count: hitAndRunCount 
    };
  }

  return { allowed: true, count: hitAndRunCount };
}

// Actualizar hit and run para un usuario en un torrent específico
export async function updateHitAndRun(
  userId: string, 
  torrentId: string, 
  left: number, 
  event: string | null
): Promise<void> {
  const config = await getHitAndRunConfig();
  
  console.log(`[updateHitAndRun] Processing user ${userId} on torrent ${torrentId}`);
  console.log(`[updateHitAndRun] Event: ${event}, Left: ${left}, Required seeding: ${config.requiredSeedingMinutes} minutes`);
  
  // Buscar registro existente de HitAndRun
  let record = await prisma.hitAndRun.findFirst({ 
    where: { userId, torrentId } 
  });
  const now = new Date();
  
  // Solo crear un registro de hit and run cuando el usuario completa la descarga
  if (!record && event === 'completed') {
    console.log(`[updateHitAndRun] Creating new hit and run record for user ${userId} - download completed`);
    record = await prisma.hitAndRun.create({
      data: {
        userId,
        torrentId,
        downloadedAt: now,
        lastSeededAt: left === 0 ? now : null,
        totalSeedingTime: 0,
        isHitAndRun: false
      }
    });
    console.log(`[updateHitAndRun] Record created with ID: ${record.id}`);
  } else if (!record) {
    console.log(`[updateHitAndRun] No record exists and event is not 'completed' - skipping user ${userId}`);
    return; // No rastrear este usuario si no ha completado una descarga
  } else {
    console.log(`[updateHitAndRun] Found existing record ID: ${record.id}`);
    console.log(`[updateHitAndRun] Current totalSeedingTime: ${record.totalSeedingTime} minutes`);
    console.log(`[updateHitAndRun] Current lastSeededAt: ${record.lastSeededAt}`);
    console.log(`[updateHitAndRun] Current isHitAndRun: ${record.isHitAndRun}`);
  }
  
  // Actualizar tiempo de seeding cuando el usuario está haciendo seeding (left == 0)
  let totalSeedingTime = record.totalSeedingTime;
  let lastSeededAt = record.lastSeededAt;
  const wasSeedingBefore = lastSeededAt !== null;
  
  if (left === 0) {
    console.log(`[updateHitAndRun] User is currently seeding (left = 0)`);
    if (lastSeededAt) {
      // Calcular minutos desde el último announce mientras hace seeding
      const minutes = Math.floor((now.getTime() - new Date(lastSeededAt).getTime()) / 60000);
      if (minutes > 0) {
        totalSeedingTime += minutes;
        console.log(`[updateHitAndRun] Added ${minutes} minutes of seeding time`);
        console.log(`[updateHitAndRun] Total seeding time now: ${totalSeedingTime} minutes`);
      } else {
        console.log(`[updateHitAndRun] No time elapsed since last announce (${minutes} minutes)`);
      }
    } else {
      console.log(`[updateHitAndRun] No previous lastSeededAt, starting fresh`);
    }
    lastSeededAt = now;
    console.log(`[updateHitAndRun] Updated lastSeededAt to: ${now}`);
  } else {
    console.log(`[updateHitAndRun] User is not seeding (left = ${left})`);
    // Si el usuario estaba haciendo seeding antes pero ahora tiene left > 0, calcular tiempo final de seeding
    if (lastSeededAt) {
      const minutes = Math.floor((now.getTime() - new Date(lastSeededAt).getTime()) / 60000);
      if (minutes > 0) {
        totalSeedingTime += minutes;
        console.log(`[updateHitAndRun] User stopped seeding, added final ${minutes} minutes`);
        console.log(`[updateHitAndRun] Total seeding time now: ${totalSeedingTime} minutes`);
      }
      lastSeededAt = null; // Resetear ya que no está haciendo seeding
    }
  }
  
  // Verificar condiciones de hit and run
  let isHitAndRun = record.isHitAndRun;
  
  // Verificar hit and run en estos escenarios:
  // 1. Usuario se detuvo explícitamente (event === 'stopped')
  // 2. Usuario estaba haciendo seeding antes pero ahora tiene left > 0 (dejó de hacer seeding sin evento)
  const shouldCheckHitAndRun = event === 'stopped' || (wasSeedingBefore && left > 0);
  
  if (shouldCheckHitAndRun) {
    const reason = event === 'stopped' ? 'explicitly stopped' : 'stopped seeding (left > 0)';
    console.log(`[updateHitAndRun] User ${reason}`);
    console.log(`[updateHitAndRun] Checking hit and run: ${totalSeedingTime} < ${config.requiredSeedingMinutes}?`);
    
    if (totalSeedingTime < config.requiredSeedingMinutes) {
      isHitAndRun = true;
      console.log(`[updateHitAndRun] HIT AND RUN DETECTED! User seeded for ${totalSeedingTime} minutes, required: ${config.requiredSeedingMinutes} minutes`);
    } else {
      console.log(`[updateHitAndRun] User completed required seeding: ${totalSeedingTime} >= ${config.requiredSeedingMinutes} minutes`);
    }
  } else if (event === 'completed') {
    console.log(`[updateHitAndRun] User completed download`);
  } else {
    console.log(`[updateHitAndRun] Other event: ${event}`);
  }
  
  console.log(`[updateHitAndRun] Final values - totalSeedingTime: ${totalSeedingTime}, isHitAndRun: ${isHitAndRun}`);
  
  await prisma.hitAndRun.update({
    where: { id: record.id },
    data: {
      lastSeededAt,
      totalSeedingTime,
      isHitAndRun
    }
  });
  
  console.log(`[updateHitAndRun] Record updated successfully`);
}

// Verificar hit and runs basado en grace period (usuarios que no han anunciado recientemente)
export async function checkHitAndRunGracePeriod(): Promise<void> {
  const config = await getHitAndRunConfig();
  const GRACE_PERIOD_MINUTES = 30; // Grace period de 30 minutos
  
  console.log(`[checkHitAndRunGracePeriod] Checking for hit and runs with grace period of ${GRACE_PERIOD_MINUTES} minutes`);
  
  const gracePeriodAgo = new Date(Date.now() - GRACE_PERIOD_MINUTES * 60 * 1000);
  
  // Encontrar todos los registros de hit and run donde los usuarios no han anunciado recientemente
  const records = await prisma.hitAndRun.findMany({
    where: {
      isHitAndRun: false, // Solo verificar registros que no están marcados como hit and run
      lastSeededAt: {
        lt: gracePeriodAgo // Último seeding antes del grace period
      }
    },
    include: {
      user: true,
      torrent: true
    }
  });
  
  console.log(`[checkHitAndRunGracePeriod] Found ${records.length} records to check for grace period violations`);
  
  for (const record of records) {
    console.log(`[checkHitAndRunGracePeriod] Checking user ${record.user.username} on torrent ${record.torrent.name}`);
    console.log(`[checkHitAndRunGracePeriod] Total seeding time: ${record.totalSeedingTime} minutes, Required: ${config.requiredSeedingMinutes} minutes`);
    
    if (record.totalSeedingTime < config.requiredSeedingMinutes) {
      console.log(`[checkHitAndRunGracePeriod] HIT AND RUN DETECTED via grace period! User ${record.user.username} seeded for ${record.totalSeedingTime} minutes, required: ${config.requiredSeedingMinutes} minutes`);
      
      await prisma.hitAndRun.update({
        where: { id: record.id },
        data: { isHitAndRun: true }
      });
    } else {
      console.log(`[checkHitAndRunGracePeriod] User ${record.user.username} completed required seeding: ${record.totalSeedingTime} >= ${config.requiredSeedingMinutes} minutes`);
    }
  }
}

// Obtener estadísticas de hit and run para un usuario
export async function getUserHitAndRunStats(userId: string): Promise<{
  totalHitAndRuns: number;
  activeHitAndRuns: number;
  totalSeedingTime: number;
  requiredSeedingTime: number;
}> {
  const config = await getHitAndRunConfig();
  
  const hitAndRuns = await prisma.hitAndRun.findMany({
    where: { userId }
  });
  
  const totalHitAndRuns = hitAndRuns.length;
  const activeHitAndRuns = hitAndRuns.filter(r => r.isHitAndRun).length;
  const totalSeedingTime = hitAndRuns.reduce((sum, r) => sum + r.totalSeedingTime, 0);
  
  return {
    totalHitAndRuns,
    activeHitAndRuns,
    totalSeedingTime,
    requiredSeedingTime: config.requiredSeedingMinutes
  };
} 