import { AgentInsight } from '../../../domain/entities/agent-insight.entity';

export interface GetUserInsightsUseCase {
  execute(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<{ data: AgentInsight[]; total: number }>;
}
