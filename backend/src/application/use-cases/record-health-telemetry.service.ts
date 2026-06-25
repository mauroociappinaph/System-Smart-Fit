import { randomUUID } from 'crypto';
import { RecordHealthTelemetryUseCase } from '../ports/in/record-health-telemetry.use-case';
import { RecordHealthTelemetryCommand } from '../ports/in/record-health-telemetry.command';
import { HealthTelemetryRepository } from '../ports/out/health-telemetry.repository';
import { HealthTelemetry } from '../../domain/entities/health-telemetry.entity';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class RecordHealthTelemetryService implements RecordHealthTelemetryUseCase {
  constructor(
    @Inject('HealthTelemetryRepository') private readonly telemetryRepository: HealthTelemetryRepository,
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

    // 2. Persistence: Save Entity via Output Port
    await this.telemetryRepository.save(entity);

    // 3. (Pending) Publish Domain Event via EventBus Port
    // await this.eventBus.publish(event);
  }
}
