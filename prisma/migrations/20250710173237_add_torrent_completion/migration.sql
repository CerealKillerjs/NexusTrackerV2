-- CreateTable
CREATE TABLE "TorrentCompletion" (
    "id" TEXT NOT NULL,
    "torrentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "peerId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TorrentCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TorrentCompletion_torrentId_idx" ON "TorrentCompletion"("torrentId");

-- CreateIndex
CREATE INDEX "TorrentCompletion_userId_idx" ON "TorrentCompletion"("userId");

-- CreateIndex
CREATE INDEX "TorrentCompletion_peerId_idx" ON "TorrentCompletion"("peerId");

-- AddForeignKey
ALTER TABLE "TorrentCompletion" ADD CONSTRAINT "TorrentCompletion_torrentId_fkey" FOREIGN KEY ("torrentId") REFERENCES "torrents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TorrentCompletion" ADD CONSTRAINT "TorrentCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
