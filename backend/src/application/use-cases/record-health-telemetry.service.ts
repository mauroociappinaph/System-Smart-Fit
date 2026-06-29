import { randomUUID } from 'crypto';
import { RecordHealthTelemetryUseCase } from '../ports/in/record-health-telemetry.use-case';
import { RecordHealthTelemetryCommand } from '../ports/in/record-health-telemetry.command';
import type { HealthTelemetryRepository } from '../ports/out/health-telemetry.repository';
import { HealthTelemetry } from '../../domain/entities/health-telemetry.entity';
import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { OutboxRepositoryPort } from '../ports/out/event-outbox.repository';
import { OUTBOX_REPOSITORY_PORT } from '../ports/out/event-outbox.repository';

@Injectable()
export class RecordHealthTelemetryService implements RecordHealthTelemetryUseCase {
  constructor(
    @Inject('HealthTelemetryRepository')
    private readonly telemetryRepository: HealthTelemetryRepository,
    @Inject(OUTBOX_REPOSITORY_PORT)
    private readonly outboxRepository: OutboxRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: RecordHealthTelemetryCommand): Promise<void> {
    const id = randomUUID();
    const eventId = randomUUID();
    const serverReceivedAt = Date.now();
    const correlationId = command.correlationId || randomUUID();

    // 1. Domain Logic: Create Entity and Event
    const { entity, event } = HealthTelemetry.record(
      id,
      eventId,
      command.userId,
      command.metricType,
      command.value,
      command.unit,
      command.deviceTimestamp,
      serverReceivedAt,
      correlationId,
    );

    // 2. Persistence: Save Entity + Outbox Event in Transaction
    await this.prisma.$transaction(async (tx) => {
      await this.telemetryRepository.save(entity, tx);
      await this.outboxRepository.save(event, tx);
    });
  }
}
