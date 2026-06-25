import { AgentInsight } from '../../../domain/entities/agent-insight.entity';

export interface AgentInsightRepository {
  save(insight: AgentInsight): Promise<void>;
  findById(id: string): Promise<AgentInsight | null>;
  findByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<AgentInsight[]>;
  countByUserId(userId: string): Promise<number>;
}
