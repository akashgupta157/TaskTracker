-- DropForeignKey
ALTER TABLE "public"."_CardAssignees" DROP CONSTRAINT "_CardAssignees_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CardAssignees" DROP CONSTRAINT "_CardAssignees_B_fkey";

-- AlterTable
ALTER TABLE "public"."Card" ADD COLUMN     "boardMemberId" TEXT;

-- AlterTable
ALTER TABLE "public"."Invitation" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '24 hours');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "cardId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_boardMemberId_fkey" FOREIGN KEY ("boardMemberId") REFERENCES "public"."BoardMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CardAssignees" ADD CONSTRAINT "_CardAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."BoardMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CardAssignees" ADD CONSTRAINT "_CardAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
