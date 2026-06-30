import { Injectable } from '@nestjs/common';
import type { HealthTelemetryRepository } from '../ports/out/health-telemetry.repository';
import type { HealthDataContext } from '../dto/health-data-context.dto';

@Injectable()
export class HealthDataNormalizer {
  constructor(
    private readonly telemetryRepository: HealthTelemetryRepository,
  ) {}

  async buildContext(
    userId: string,
    userState?: string,
  ): Promise<HealthDataContext> {
    const recent = await this.telemetryRepository.findByUserId(userId, {
      limit: 10,
    });

    return {
      userId,
      recentTelemetry: recent.map((t) => ({
        metricType: t.metricType,
        value: t.value,
        unit: t.unit,
        recordedAt: t.serverReceivedAt,
      })),
      userState,
    };
  }
}
