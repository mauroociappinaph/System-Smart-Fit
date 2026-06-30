import { AgentInsight } from '../../../domain/entities/agent-insight.entity';

export const GENERATE_INSIGHTS_PORT = 'GenerateInsightsPort';

export interface GenerateInsightsPort {
  generateInsights(
    userId: string,
    correlationId: string,
    telemetryId?: string,
  ): Promise<AgentInsight[]>;
  validateInsight(insightId: string, action: string): Promise<void>;
}
