/*
  Warnings:

  - Added the required column `boardId` to the `cards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."cards" ADD COLUMN     "boardId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."invitations" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '24 hours');

-- AddForeignKey
ALTER TABLE "public"."cards" ADD CONSTRAINT "cards_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "public"."boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
