/*
  Warnings:

  - You are about to drop the column `parentId` on the `comments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_parentId_fkey";

-- AlterTable
ALTER TABLE "Peer" ADD COLUMN     "downloaded" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "uploaded" BIGINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "parentId";

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "infoHash" TEXT NOT NULL,
    "peerId" TEXT NOT NULL,
    "uploaded" JSONB NOT NULL,
    "downloaded" JSONB NOT NULL,
    "left" BIGINT NOT NULL DEFAULT 0,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Progress_infoHash_idx" ON "Progress"("infoHash");

-- CreateIndex
CREATE INDEX "Progress_lastSeen_idx" ON "Progress"("lastSeen");

-- CreateIndex
CREATE INDEX "Progress_peerId_idx" ON "Progress"("peerId");

-- CreateIndex
CREATE INDEX "Progress_userId_idx" ON "Progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_userId_infoHash_peerId_key" ON "Progress"("userId", "infoHash", "peerId");

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
