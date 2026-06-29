import { Injectable, Logger } from '@nestjs/common';
import { AgentInsight } from '../../domain/entities/agent-insight.entity';

/**
 * Port interface for AI inference generation.
 * TODO: extract to a proper port file under application/ports/out/
 */
export const GENERATE_INSIGHTS_PORT = 'GenerateInsightsPort';

export interface GenerateInsightsPort {
  generateInsights(userId: string, correlationId: string, telemetryId?: string): Promise<AgentInsight[]>;
  validateInsight(insightId: string, action: string): Promise<void>;
}

@Injectable()
export class InferenceStubAdapter implements GenerateInsightsPort {
  private readonly logger = new Logger(InferenceStubAdapter.name);

  async generateInsights(userId: string, _correlationId: string, _telemetryId?: string): Promise<AgentInsight[]> {
    this.logger.warn(`Using stub inference adapter for user ${userId}. TODO: replace with real AI integration.`);
    return []; // Stub: return empty until real adapter is implemented
  }

  async validateInsight(_insightId: string, _action: string): Promise<void> {
    this.logger.warn('Using stub inference adapter for validation.');
    // Stub: no-op
  }
}
