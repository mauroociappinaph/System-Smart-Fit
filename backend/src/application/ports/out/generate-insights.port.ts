import { AgentInsight } from '../../../domain/entities/agent-insight.entity';
import { HealthDataContext } from '../../dto/health-data-context.dto';

export const GENERATE_INSIGHTS_PORT = 'GenerateInsightsPort';

export interface GenerateInsightsPort {
  generateInsights(
    userId: string,
    correlationId: string,
    telemetryId?: string,
    context?: HealthDataContext,
  ): Promise<AgentInsight[]>;
  validateInsight(insightId: string, action: string): Promise<void>;
}
