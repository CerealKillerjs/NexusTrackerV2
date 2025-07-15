import { prisma } from '@/app/lib/prisma';

// Fetch bonus per GB from config
type BonusConfig = { perGb: number };
export async function getBonusConfig(): Promise<BonusConfig> {
  const config = await prisma.configuration.findUnique({ where: { key: 'BONUS_PER_GB' } });
  return { perGb: config ? parseInt(config.value, 10) : 1 };
}

// Award bonus points for upload delta (in bytes)
export async function awardBonusPoints(userId: string, uploadDelta: number): Promise<number> {
  const { perGb } = await getBonusConfig();
  const GB = 1e6; // 1 MB for testing
  if (uploadDelta < GB) {
    console.log('[BONUS] Not enough upload for bonus:', { userId, uploadDelta, perGb });
    return 0;
  }
  const bonus = Math.floor(uploadDelta / GB) * perGb;
  if (bonus > 0) {
    await prisma.user.update({ where: { id: userId }, data: { bonusPoints: { increment: bonus } } });
    console.log('[BONUS] Awarded bonus points:', { userId, uploadDelta, perGb, bonus });
  } else {
    console.log('[BONUS] No bonus awarded:', { userId, uploadDelta, perGb });
  }
  return bonus;
} 