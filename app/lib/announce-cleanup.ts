import { prisma } from '@/app/lib/prisma';

/**
 * Clean up old announce rate limit records
 * This should be run periodically (e.g., daily) to prevent database bloat
 */
export async function cleanupAnnounceRateLimits() {
  try {
    // Delete rate limit records older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const deletedCount = await prisma.announceRateLimit.deleteMany({
      where: {
        lastAnnounce: {
          lt: sevenDaysAgo
        }
      }
    });

    console.log(`Cleaned up ${deletedCount.count} old announce rate limit records`);
    return deletedCount.count;
  } catch (error) {
    console.error('Error cleaning up announce rate limits:', error);
    throw error;
  }
}

/**
 * Get announce rate limiting statistics
 */
export async function getAnnounceRateLimitStats() {
  try {
    const [totalRecords, recentRecords, hourlyStats] = await Promise.all([
      // Total records
      prisma.announceRateLimit.count(),
      
      // Records from last 24 hours
      prisma.announceRateLimit.count({
        where: {
          lastAnnounce: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Hourly announce count for last 24 hours
      prisma.announceRateLimit.groupBy({
        by: ['userId'],
        where: {
          lastAnnounce: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      })
    ]);

    return {
      totalRecords,
      recentRecords,
      topUsers: hourlyStats.map((stat: { userId: string; _count: { id: number } }) => ({
        userId: stat.userId,
        announceCount: stat._count.id
      }))
    };
  } catch (error) {
    console.error('Error getting announce rate limit stats:', error);
    throw error;
  }
} 