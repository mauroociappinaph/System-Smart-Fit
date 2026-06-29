import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { HealthTelemetryRepository } from '../../application/ports/out/health-telemetry.repository';
import { HealthTelemetry } from '../../domain/entities/health-telemetry.entity';

@Injectable()
export class HealthTelemetryPrismaRepository implements HealthTelemetryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(
    telemetry: HealthTelemetry,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    await client.healthTelemetry.create({
      data: {
        id: telemetry.id,
        userId: telemetry.userId,
        metricType: telemetry.metricType,
        value: telemetry.value,
        unit: telemetry.unit,
        deviceTimestamp: telemetry.deviceTimestamp,
        serverReceivedAt: telemetry.serverReceivedAt,
        correlationId: telemetry.correlationId,
      },
    });
  }
}
