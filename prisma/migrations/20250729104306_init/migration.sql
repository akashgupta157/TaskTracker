/*
  Warnings:

  - You are about to drop the column `labels` on the `Card` table. All the data in the column will be lost.
  - The `priority` column on the `Card` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "labels",
DROP COLUMN "priority",
ADD COLUMN     "priority" "Priority" DEFAULT 'MEDIUM';

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bgColor" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
