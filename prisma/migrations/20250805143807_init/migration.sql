/*
  Warnings:

  - You are about to drop the `Label` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Label" DROP CONSTRAINT "Label_cardId_fkey";

-- AlterTable
ALTER TABLE "public"."Card" ADD COLUMN     "priority" TEXT;

-- DropTable
DROP TABLE "public"."Label";
