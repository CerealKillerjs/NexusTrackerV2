import { prisma } from '@/app/lib/prisma';

// Fetch minimum ratio and grace period from config
type RatioConfig = { minRatio: number, graceMb: number };
export async function getRatioConfig(): Promise<RatioConfig> {
  const minRatioConfig = await prisma.configuration.findUnique({ where: { key: 'MINIMUM_RATIO' } });
  const graceConfig = await prisma.configuration.findUnique({ where: { key: 'RATIO_GRACE_MB' } });
  return {
    minRatio: minRatioConfig ? parseFloat(minRatioConfig.value) : 0.4,
    graceMb: graceConfig ? parseInt(graceConfig.value, 10) : 0,
  };
}

// Calculate and enforce ratio
export async function checkAndUpdateRatio(userId: string): Promise<{ allowed: boolean; failureReason?: string; ratio: number }> {
  const { minRatio, graceMb } = await getRatioConfig();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { uploaded: true, downloaded: true } });
  if (!user) return { allowed: false, failureReason: 'User not found', ratio: 0 };
  const up = Number(user.uploaded);
  const down = Number(user.downloaded);
  const ratio = down === 0 ? -1 : Number((up / down).toFixed(2));
  // Grace period: allow if downloaded < grace period
  if (graceMb > 0 && down < graceMb * 1024 * 1024) {
    return { allowed: true, ratio };
  }
  if (minRatio !== -1 && ratio !== -1 && ratio < minRatio) {
    return { allowed: false, failureReason: `Ratio is below minimum threshold ${minRatio}.`, ratio };
  }
  return { allowed: true, ratio };
} 