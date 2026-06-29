import { Prisma } from '@prisma/client';
import { AgentInsight } from '../../../domain/entities/agent-insight.entity';

export interface DateFilter {
  startDate?: number;
  endDate?: number;
}

export interface FindByUserIdOptions {
  limit?: number;
  offset?: number;
  dateFilter?: DateFilter;
}

export interface AgentInsightRepository {
  save(insight: AgentInsight, tx?: Prisma.TransactionClient): Promise<void>;
  findById(id: string): Promise<AgentInsight | null>;
  findByUserId(
    userId: string,
    options?: FindByUserIdOptions,
  ): Promise<AgentInsight[]>;
  countByUserId(userId: string, dateFilter?: DateFilter): Promise<number>;
}
