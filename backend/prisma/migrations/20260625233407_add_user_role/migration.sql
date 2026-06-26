-- CreateTable
CREATE TABLE "health_telemetry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "deviceTimestamp" BIGINT NOT NULL,
    "serverReceivedAt" BIGINT NOT NULL,
    "correlationId" TEXT NOT NULL,

    CONSTRAINT "health_telemetry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "birthDate" BIGINT NOT NULL,
    "goal" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "registeredAt" BIGINT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
