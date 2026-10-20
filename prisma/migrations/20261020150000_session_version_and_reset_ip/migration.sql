-- AlterTable
ALTER TABLE "AdminAuth" ADD COLUMN     "sessionVersion" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PasswordResetToken" ADD COLUMN     "ip" TEXT;
