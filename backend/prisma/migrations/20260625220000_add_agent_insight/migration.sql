-- CreateTable
CREATE TABLE "agent_insights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "validationStatus" TEXT NOT NULL,
    "createdAt" BIGINT NOT NULL,
    "updatedAt" BIGINT NOT NULL,

    CONSTRAINT "agent_insights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_insights_userId_idx" ON "agent_insights"("userId");

-- CreateIndex
CREATE INDEX "agent_insights_validationStatus_idx" ON "agent_insights"("validationStatus");

-- CreateIndex
CREATE INDEX "agent_insights_userId_validationStatus_idx" ON "agent_insights"("userId", "validationStatus");
