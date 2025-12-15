-- AlterTable
ALTER TABLE "public"."invitations" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '24 hours');
