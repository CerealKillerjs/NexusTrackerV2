-- CreateTable
CREATE TABLE "announce_rate_limits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "torrentId" TEXT NOT NULL,
    "lastAnnounce" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "announceCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "announce_rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "announce_rate_limits_ip_idx" ON "announce_rate_limits"("ip");

-- CreateIndex
CREATE INDEX "announce_rate_limits_lastAnnounce_idx" ON "announce_rate_limits"("lastAnnounce");

-- CreateIndex
CREATE UNIQUE INDEX "announce_rate_limits_userId_torrentId_key" ON "announce_rate_limits"("userId", "torrentId");

-- AddForeignKey
ALTER TABLE "announce_rate_limits" ADD CONSTRAINT "announce_rate_limits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announce_rate_limits" ADD CONSTRAINT "announce_rate_limits_torrentId_fkey" FOREIGN KEY ("torrentId") REFERENCES "torrents"("id") ON DELETE CASCADE ON UPDATE CASCADE; 