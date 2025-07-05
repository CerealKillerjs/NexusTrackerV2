/*
  Warnings:

  - A unique constraint covering the columns `[uid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bonusPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "invitedBy" TEXT,
ADD COLUMN     "lastSeen" TIMESTAMP(3),
ADD COLUMN     "remainingInvites" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "timezone" TEXT DEFAULT 'UTC',
ADD COLUMN     "totpBackup" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totpQr" TEXT,
ADD COLUMN     "totpSecret" TEXT,
ADD COLUMN     "uid" TEXT;

-- CreateTable
CREATE TABLE "Torrent" (
    "id" TEXT NOT NULL,
    "infoHash" TEXT NOT NULL,
    "binary" TEXT NOT NULL,
    "poster" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "source" TEXT,
    "image" TEXT,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "size" BIGINT NOT NULL,
    "files" JSONB NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "freeleech" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "groupId" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "mediaInfo" TEXT,
    "isProtected" BOOLEAN NOT NULL DEFAULT false,
    "protectedPassword" TEXT,

    CONSTRAINT "Torrent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TorrentVote" (
    "id" TEXT NOT NULL,
    "torrentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TorrentVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "torrentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "usedBy" TEXT,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "filledBy" TEXT,
    "filledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "torrentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "torrentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "torrentId" TEXT NOT NULL,
    "downloaded" BIGINT NOT NULL DEFAULT 0,
    "uploaded" BIGINT NOT NULL DEFAULT 0,
    "left" BIGINT NOT NULL,
    "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProtectedDownload" (
    "id" TEXT NOT NULL,
    "torrentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "torrentName" TEXT NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "passwordUsed" TEXT NOT NULL,

    CONSTRAINT "ProtectedDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wiki" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wiki_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Torrent_infoHash_key" ON "Torrent"("infoHash");

-- CreateIndex
CREATE INDEX "Torrent_infoHash_idx" ON "Torrent"("infoHash");

-- CreateIndex
CREATE INDEX "Torrent_type_idx" ON "Torrent"("type");

-- CreateIndex
CREATE INDEX "Torrent_created_idx" ON "Torrent"("created");

-- CreateIndex
CREATE INDEX "Torrent_uploadedBy_idx" ON "Torrent"("uploadedBy");

-- CreateIndex
CREATE UNIQUE INDEX "TorrentVote_torrentId_userId_key" ON "TorrentVote"("torrentId", "userId");

-- CreateIndex
CREATE INDEX "Comment_torrentId_idx" ON "Comment"("torrentId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_code_key" ON "Invite"("code");

-- CreateIndex
CREATE INDEX "Invite_code_idx" ON "Invite"("code");

-- CreateIndex
CREATE INDEX "Request_category_idx" ON "Request"("category");

-- CreateIndex
CREATE INDEX "Request_createdBy_idx" ON "Request"("createdBy");

-- CreateIndex
CREATE INDEX "Report_torrentId_idx" ON "Report"("torrentId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_torrentId_key" ON "Bookmark"("userId", "torrentId");

-- CreateIndex
CREATE INDEX "Progress_userId_idx" ON "Progress"("userId");

-- CreateIndex
CREATE INDEX "Progress_torrentId_idx" ON "Progress"("torrentId");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_userId_torrentId_key" ON "Progress"("userId", "torrentId");

-- CreateIndex
CREATE INDEX "ProtectedDownload_torrentId_idx" ON "ProtectedDownload"("torrentId");

-- CreateIndex
CREATE INDEX "ProtectedDownload_userId_idx" ON "ProtectedDownload"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wiki_title_key" ON "Wiki"("title");

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Torrent" ADD CONSTRAINT "Torrent_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TorrentVote" ADD CONSTRAINT "TorrentVote_torrentId_fkey" FOREIGN KEY ("torrentId") REFERENCES "Torrent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TorrentVote" ADD CONSTRAINT "TorrentVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_torrentId_fkey" FOREIGN KEY ("torrentId") REFERENCES "Torrent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_usedBy_fkey" FOREIGN KEY ("usedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_filledBy_fkey" FOREIGN KEY ("filledBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_torrentId_fkey" FOREIGN KEY ("torrentId") REFERENCES "Torrent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_torrentId_fkey" FOREIGN KEY ("torrentId") REFERENCES "Torrent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProtectedDownload" ADD CONSTRAINT "ProtectedDownload_torrentId_fkey" FOREIGN KEY ("torrentId") REFERENCES "Torrent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProtectedDownload" ADD CONSTRAINT "ProtectedDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
