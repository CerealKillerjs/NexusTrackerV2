/*
  Warnings:

  - Added the required column `mode` to the `Progress` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Progress_peerId_idx";

-- DropIndex
DROP INDEX "Progress_userId_infoHash_peerId_key";

-- AlterTable
ALTER TABLE "Progress" ADD COLUMN     "mode" TEXT NOT NULL;
