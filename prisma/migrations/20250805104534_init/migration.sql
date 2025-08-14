/*
  Warnings:

  - You are about to drop the column `priority` on the `Card` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Card" DROP COLUMN "priority";

-- DropEnum
DROP TYPE "public"."Priority";
