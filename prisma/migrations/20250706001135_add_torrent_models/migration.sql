-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bonusPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "downloaded" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "ratio" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "uploaded" BIGINT NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "torrents" (
    "id" TEXT NOT NULL,
    "infoHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "source" TEXT,
    "binary" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "size" BIGINT NOT NULL,
    "files" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "freeleech" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "anonymous" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "torrents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "torrentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "torrentId" TEXT,
    "commentId" TEXT,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "torrentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "torrents_infoHash_key" ON "torrents"("infoHash");

-- CreateIndex
CREATE UNIQUE INDEX "votes_userId_torrentId_type_key" ON "votes"("userId", "torrentId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "votes_userId_commentId_type_key" ON "votes"("userId", "commentId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_userId_torrentId_key" ON "bookmarks"("userId", "torrentId");

-- AddForeignKey
ALTER TABLE "torrents" ADD CONSTRAINT "torrents_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_torrentId_fkey" FOREIGN KEY ("torrentId") REFERENCES "torrents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_torrentId_fkey" FOREIGN KEY ("torrentId") REFERENCES "torrents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_torrentId_fkey" FOREIGN KEY ("torrentId") REFERENCES "torrents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
