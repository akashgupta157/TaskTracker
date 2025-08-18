-- CreateEnum
CREATE TYPE "public"."InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "public"."Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (now() + interval '24 hours'),
    "status" "public"."InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "inviterId" TEXT NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "public"."Invitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_email_boardId_key" ON "public"."Invitation"("email", "boardId");

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "public"."Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
