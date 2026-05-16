-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM (
  'CARD_CREATED',
  'CARD_DELETED',
  'CARD_MOVED',
  'CARD_COMPLETED',
  'CARD_REOPENED',
  'TITLE_CHANGED',
  'DESCRIPTION_CHANGED',
  'PRIORITY_CHANGED',
  'DUE_DATE_SET',
  'DUE_DATE_CHANGED',
  'DUE_DATE_REMOVED',
  'ASSIGNEE_ADDED',
  'ASSIGNEE_REMOVED',
  'CHECKLIST_ADDED',
  'CHECKLIST_ITEM_CHECKED',
  'CHECKLIST_ITEM_UNCHECKED',
  'CHECKLIST_ITEM_REMOVED',
  'ATTACHMENT_ADDED',
  'ATTACHMENT_REMOVED',
  'COMMENT_ADDED',
  'COMMENT_DELETED'
);

-- CreateTable
CREATE TABLE "public"."comments" (
  "id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "cardId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "isEdited" BOOLEAN NOT NULL DEFAULT false,

  CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activities" (
  "id" TEXT NOT NULL,
  "type" "public"."ActivityType" NOT NULL,
  "cardId" TEXT,
  "boardId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "data" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comments_cardId_idx" ON "public"."comments"("cardId");
CREATE INDEX "comments_userId_idx" ON "public"."comments"("userId");
CREATE INDEX "comments_cardId_createdAt_idx" ON "public"."comments"("cardId", "createdAt");

-- CreateIndex
CREATE INDEX "activities_cardId_idx" ON "public"."activities"("cardId");
CREATE INDEX "activities_boardId_idx" ON "public"."activities"("boardId");
CREATE INDEX "activities_userId_idx" ON "public"."activities"("userId");
CREATE INDEX "activities_cardId_createdAt_idx" ON "public"."activities"("cardId", "createdAt");
CREATE INDEX "activities_boardId_createdAt_idx" ON "public"."activities"("boardId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "public"."boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
