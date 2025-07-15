/*
  Warnings:

  - Added the required column `downloaded` to the `TorrentCompletion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploaded` to the `TorrentCompletion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TorrentCompletion" ADD COLUMN     "downloaded" BIGINT NOT NULL,
ADD COLUMN     "uploaded" BIGINT NOT NULL;
