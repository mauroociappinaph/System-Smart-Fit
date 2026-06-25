-- CreateTable
CREATE TABLE "user_states" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentState" TEXT NOT NULL,
    "previousState" TEXT,
    "transitionedAt" BIGINT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "deletedAt" BIGINT,

    CONSTRAINT "user_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_states_userId_idx" ON "user_states"("userId");

-- CreateIndex
CREATE INDEX "user_states_currentState_idx" ON "user_states"("currentState");

-- CreateIndex
CREATE INDEX "user_states_userId_currentState_idx" ON "user_states"("userId", "currentState");
