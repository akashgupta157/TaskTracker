-- AlterTable
ALTER TABLE "public"."invitations" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '24 hours');

-- CreateTable
CREATE TABLE "public"."card_assignments" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "boardMemberId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" TEXT NOT NULL,

    CONSTRAINT "card_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "card_assignments_cardId_idx" ON "public"."card_assignments"("cardId");

-- CreateIndex
CREATE INDEX "card_assignments_boardMemberId_idx" ON "public"."card_assignments"("boardMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "card_assignments_cardId_boardMemberId_key" ON "public"."card_assignments"("cardId", "boardMemberId");

-- AddForeignKey
ALTER TABLE "public"."card_assignments" ADD CONSTRAINT "card_assignments_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_assignments" ADD CONSTRAINT "card_assignments_boardMemberId_fkey" FOREIGN KEY ("boardMemberId") REFERENCES "public"."board_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_assignments" ADD CONSTRAINT "card_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
