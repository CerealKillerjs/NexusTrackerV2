-- CreateTable
CREATE TABLE "Peer" (
    "id" TEXT NOT NULL,
    "peerId" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "torrentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastAnnounce" TIMESTAMP(3) NOT NULL,
    "client" TEXT,

    CONSTRAINT "Peer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Peer_torrentId_idx" ON "Peer"("torrentId");

-- CreateIndex
CREATE INDEX "Peer_userId_idx" ON "Peer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Peer_peerId_torrentId_key" ON "Peer"("peerId", "torrentId");

-- AddForeignKey
ALTER TABLE "Peer" ADD CONSTRAINT "Peer_torrentId_fkey" FOREIGN KEY ("torrentId") REFERENCES "torrents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Peer" ADD CONSTRAINT "Peer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
