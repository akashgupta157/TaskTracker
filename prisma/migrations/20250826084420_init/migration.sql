/*
  Warnings:

  - You are about to drop the column `cardId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Attachment" DROP CONSTRAINT "Attachment_cardId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_cardId_fkey";

-- AlterTable
ALTER TABLE "public"."Card" ADD COLUMN     "attachments" JSONB;

-- AlterTable
ALTER TABLE "public"."Invitation" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '24 hours');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "cardId";

-- DropTable
DROP TABLE "public"."Attachment";

-- CreateTable
CREATE TABLE "public"."_CardAssignees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CardAssignees_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CardAssignees_B_index" ON "public"."_CardAssignees"("B");

-- AddForeignKey
ALTER TABLE "public"."_CardAssignees" ADD CONSTRAINT "_CardAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CardAssignees" ADD CONSTRAINT "_CardAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
