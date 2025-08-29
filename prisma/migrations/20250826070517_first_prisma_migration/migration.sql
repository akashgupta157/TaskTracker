/*
  Warnings:

  - You are about to drop the column `admin` on the `Board` table. All the data in the column will be lost.
  - You are about to drop the column `cardId` on the `BoardMember` table. All the data in the column will be lost.
  - The `role` column on the `BoardMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `assignedTo` on the `Card` table. All the data in the column will be lost.
  - The `priority` column on the `Card` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[boardId,userId]` on the table `BoardMember` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `adminId` to the `Board` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- DropForeignKey
ALTER TABLE "public"."Attachment" DROP CONSTRAINT "Attachment_cardId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Board" DROP CONSTRAINT "Board_admin_fkey";

-- DropForeignKey
ALTER TABLE "public"."BoardMember" DROP CONSTRAINT "BoardMember_boardId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BoardMember" DROP CONSTRAINT "BoardMember_cardId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BoardMember" DROP CONSTRAINT "BoardMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Card" DROP CONSTRAINT "Card_assignedTo_fkey";

-- DropForeignKey
ALTER TABLE "public"."Card" DROP CONSTRAINT "Card_listId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Invitation" DROP CONSTRAINT "Invitation_boardId_fkey";

-- DropForeignKey
ALTER TABLE "public"."List" DROP CONSTRAINT "List_boardId_fkey";

-- AlterTable
ALTER TABLE "public"."Board" DROP COLUMN "admin",
ADD COLUMN     "adminId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."BoardMember" DROP COLUMN "cardId",
DROP COLUMN "role",
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "public"."Card" DROP COLUMN "assignedTo",
DROP COLUMN "priority",
ADD COLUMN     "priority" "public"."Priority";

-- AlterTable
ALTER TABLE "public"."Invitation" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '24 hours');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "cardId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BoardMember_boardId_userId_key" ON "public"."BoardMember"("boardId", "userId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Board" ADD CONSTRAINT "Board_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BoardMember" ADD CONSTRAINT "BoardMember_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "public"."Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BoardMember" ADD CONSTRAINT "BoardMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."List" ADD CONSTRAINT "List_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "public"."Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_listId_fkey" FOREIGN KEY ("listId") REFERENCES "public"."List"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "public"."Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
