import { Injectable, Logger } from '@nestjs/common';
import type { GenerateInsightsPort } from '../../application/ports/out/generate-insights.port';
import { AgentInsight } from '../../domain/entities/agent-insight.entity';
import type { HealthDataContext } from '../../application/dto/health-data-context.dto';

@Injectable()
export class FallbackAdapter implements GenerateInsightsPort {
  private readonly logger = new Logger(FallbackAdapter.name);

  constructor(
    private readonly primaryAdapter: GenerateInsightsPort,
    private readonly fallbackAdapter: GenerateInsightsPort,
  ) {}

  async generateInsights(
    userId: string,
    correlationId: string,
    telemetryId?: string,
    context?: HealthDataContext,
  ): Promise<AgentInsight[]> {
    this.logger.log(
      `Generating insights for user ${userId} via primary adapter`,
    );

    try {
      return await this.primaryAdapter.generateInsights(
        userId,
        correlationId,
        telemetryId,
        context,
      );
    } catch (primaryError) {
      this.logger.warn(
        `Primary adapter failed: ${primaryError instanceof Error ? primaryError.message : String(primaryError)}. Falling back to secondary adapter.`,
      );

      try {
        return await this.fallbackAdapter.generateInsights(
          userId,
          correlationId,
          telemetryId,
          context,
        );
      } catch (fallbackError) {
        this.logger.error(
          `Fallback adapter also failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`,
        );
        return [];
      }
    }
  }

  async validateInsight(insightId: string, action: string): Promise<void> {
    try {
      await this.primaryAdapter.validateInsight(insightId, action);
    } catch {
      await this.fallbackAdapter.validateInsight(insightId, action);
    }
  }
}
