-- CreateTable
CREATE TABLE "event_outbox" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" BIGINT NOT NULL,
    "publishedAt" BIGINT,
    "error" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "event_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_outbox_status_createdAt_idx" ON "event_outbox"("status", "createdAt");

-- CreateIndex
CREATE INDEX "event_outbox_createdAt_idx" ON "event_outbox"("createdAt");
