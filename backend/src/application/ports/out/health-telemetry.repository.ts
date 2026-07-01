import { Prisma } from '@prisma/client';
import { HealthTelemetry } from '../../../domain/entities/health-telemetry.entity';

export interface HealthTelemetryRepository {
  save(
    telemetry: HealthTelemetry,
    tx?: Prisma.TransactionClient,
  ): Promise<void>;
  findByUserId(
    userId: string,
    options?: { limit?: number },
  ): Promise<HealthTelemetry[]>;
}
