-- CreateTable
CREATE TABLE "FailedLogin" (
    "id" SERIAL NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailedLogin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FailedLogin_createdAt_idx" ON "FailedLogin"("createdAt");
