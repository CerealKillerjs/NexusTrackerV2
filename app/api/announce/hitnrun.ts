import { prisma } from '@/app/lib/prisma';

// Fetch max hit'n'run from config
type HitnRunConfig = { maxHitnRuns: number };
export async function getHitnRunConfig(): Promise<HitnRunConfig> {
  const config = await prisma.configuration.findUnique({ where: { key: 'MAXIMUM_HITNRUNS' } });
  return { maxHitnRuns: config ? parseInt(config.value, 10) : 5 };
}

// Count user's hit'n'run cases (completed downloads with ratio < 1)
export async function checkAndUpdateHitnRun(userId: string): Promise<{ allowed: boolean; failureReason?: string; count: number }> {
  const { maxHitnRuns } = await getHitnRunConfig();
  // Get all progress records for the user
  const progresses = await prisma.progress.findMany({ where: { userId } });
  // Map to keep only the max uploaded/downloaded per (infoHash, peerId)
  const progressByKey = new Map();
  for (const p of progresses) {
    const key = `${p.infoHash}_${p.peerId}`;
    const uploaded = Number(p.uploaded ?? 0);
    const downloaded = Number(p.downloaded ?? 0);
    if (!progressByKey.has(key)) {
      progressByKey.set(key, { uploaded, downloaded, infoHash: p.infoHash });
    } else {
      const prev = progressByKey.get(key);
      progressByKey.set(key, {
        uploaded: Math.max(prev.uploaded, uploaded),
        downloaded: Math.max(prev.downloaded, downloaded),
        infoHash: p.infoHash,
      });
    }
  }
  let hitnrunCount = 0;
  console.log('[HITNRUN] Progress by key:', Array.from(progressByKey.entries()));
  for (const { uploaded, downloaded, infoHash } of progressByKey.values()) {
    // Get the torrent size
    const torrent = await prisma.torrent.findUnique({ where: { infoHash } });
    if (!torrent) continue;
    if (downloaded >= Number(torrent.size)) {
      const ratio = uploaded / downloaded;
      console.log('[HITNRUN] Checking:', { userId, infoHash, uploaded, downloaded, torrentSize: Number(torrent.size), ratio });
      if (ratio < 1) {
        hitnrunCount++;
        console.log('[HITNRUN] Hit-and-run detected! Count:', hitnrunCount);
      }
    } else {
      console.log('[HITNRUN] Not completed:', { userId, infoHash, uploaded, downloaded, torrentSize: Number(torrent.size) });
    }
  }
  console.log('[HITNRUN] Final count:', hitnrunCount);
  if (maxHitnRuns !== -1 && hitnrunCount >= maxHitnRuns) {
    return { allowed: false, failureReason: `You have committed ${maxHitnRuns} or more hit'n'runs.`, count: hitnrunCount };
  }
  return { allowed: true, count: hitnrunCount };
} 