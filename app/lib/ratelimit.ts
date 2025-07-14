import { prisma } from '@/app/lib/prisma';

export async function getAnnounceConfig() {
  const configs = await prisma.configuration.findMany({
    where: {
      key: {
        in: [
          'ANNOUNCE_RATE_LIMITING_ENABLED',
          'ANNOUNCE_INTERVAL',
          'ANNOUNCE_MIN_INTERVAL',
          'ANNOUNCE_RATE_LIMIT_PER_HOUR'
        ]
      }
    }
  });
  const config = Object.fromEntries(configs.map((c: { key: string; value: string }) => [c.key, c.value]));
  return {
    rateLimitingEnabled: config.ANNOUNCE_RATE_LIMITING_ENABLED === 'true',
    interval: parseInt(config.ANNOUNCE_INTERVAL || '900', 10),
    minInterval: parseInt(config.ANNOUNCE_MIN_INTERVAL || '300', 10),
    rateLimitPerHour: parseInt(config.ANNOUNCE_RATE_LIMIT_PER_HOUR || '60', 10)
  };
}

export async function checkRateLimit(userId: string, torrentId: string) {
  const config = await getAnnounceConfig();
  if (!config.rateLimitingEnabled) {
    return { allowed: true, retryAfter: 0 };
  }
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const rateLimitRecord = await prisma.announceRateLimit.findUnique({
    where: { userId_torrentId: { userId, torrentId } }
  });
  // Debug log
  console.log('[RateLimit] Record:', rateLimitRecord);
  if (!rateLimitRecord || rateLimitRecord.lastAnnounce <= oneHourAgo) {
    // No record or last announce was more than an hour ago: allow
    return { allowed: true, retryAfter: 0 };
  }
  // If announceCount >= limit, block
  if (rateLimitRecord.announceCount >= config.rateLimitPerHour) {
    const retryAfter = Math.ceil((rateLimitRecord.lastAnnounce.getTime() + 60 * 60 * 1000 - Date.now()) / 1000);
    console.log(`[RateLimit] Blocked: announceCount=${rateLimitRecord.announceCount}, limit=${config.rateLimitPerHour}`);
    return { allowed: false, retryAfter };
  }
  // Otherwise, allow
  return { allowed: true, retryAfter: 0 };
}

export async function updateRateLimit(userId: string, torrentId: string, ip: string) {
  const config = await getAnnounceConfig();
  if (!config.rateLimitingEnabled) return;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const rateLimitRecord = await prisma.announceRateLimit.findUnique({
    where: { userId_torrentId: { userId, torrentId } }
  });
  if (!rateLimitRecord || rateLimitRecord.lastAnnounce <= oneHourAgo) {
    // New record or last announce was more than an hour ago: reset count
    await prisma.announceRateLimit.upsert({
      where: { userId_torrentId: { userId, torrentId } },
      update: { ip, lastAnnounce: new Date(), announceCount: 1 },
      create: { userId, torrentId, ip, lastAnnounce: new Date(), announceCount: 1 }
    });
    console.log('[RateLimit] Reset or create record: announceCount=1');
  } else {
    // Within the hour: increment count
    await prisma.announceRateLimit.update({
      where: { userId_torrentId: { userId, torrentId } },
      data: { ip, lastAnnounce: new Date(), announceCount: { increment: 1 } }
    });
    console.log(`[RateLimit] Incremented: announceCount=${rateLimitRecord.announceCount + 1}`);
  }
} 