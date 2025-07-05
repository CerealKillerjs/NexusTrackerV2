-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "requestId" TEXT,
ALTER COLUMN "torrentId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "bounty" INTEGER NOT NULL DEFAULT 0,
    "candidates" JSONB[],

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "requests_index_key" ON "requests"("index");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
