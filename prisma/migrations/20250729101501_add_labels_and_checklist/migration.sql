/*
  Warnings:

  - You are about to drop the column `userId` on the `Board` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Card` table. All the data in the column will be lost.
  - The `labels` column on the `Card` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `order` on the `List` table. All the data in the column will be lost.
  - Added the required column `admin` to the `Board` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `List` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Board" DROP CONSTRAINT "Board_userId_fkey";

-- AlterTable
ALTER TABLE "Board" DROP COLUMN "userId",
ADD COLUMN     "admin" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BoardMember" ADD COLUMN     "cardId" TEXT;

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "order",
ADD COLUMN     "assignedTo" TEXT,
ADD COLUMN     "checklist" JSONB,
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "position" INTEGER NOT NULL,
ADD COLUMN     "priority" TEXT,
DROP COLUMN "labels",
ADD COLUMN     "labels" JSONB;

-- AlterTable
ALTER TABLE "List" DROP COLUMN "order",
ADD COLUMN     "position" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_admin_fkey" FOREIGN KEY ("admin") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardMember" ADD CONSTRAINT "BoardMember_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
