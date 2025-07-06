/*
  Warnings:

  - A unique constraint covering the columns `[passkey]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - The required column `passkey` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passkey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_passkey_key" ON "User"("passkey");
