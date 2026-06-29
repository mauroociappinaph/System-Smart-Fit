import { Injectable, Inject } from '@nestjs/common';
import { GetUserInsightsUseCase } from '../ports/in/get-user-insights.use-case';
import type { AgentInsightRepository } from '../ports/out/agent-insight.repository';
import { AgentInsight } from '../../domain/entities/agent-insight.entity';

export interface GetUserInsightsOptions {
  limit?: number;
  offset?: number;
  month?: number;
  year?: number;
  startDate?: number;
  endDate?: number;
}

@Injectable()
export class GetUserInsightsService implements GetUserInsightsUseCase {
  constructor(
    @Inject('AgentInsightRepository')
    private readonly agentInsightRepository: AgentInsightRepository,
  ) {}

  async execute(
    userId: string,
    options?: GetUserInsightsOptions,
  ): Promise<{ data: AgentInsight[]; total: number }> {
    const dateFilter = this.buildDateFilter(options);

    const [data, total] = await Promise.all([
      this.agentInsightRepository.findByUserId(userId, {
        limit: options?.limit,
        offset: options?.offset,
        dateFilter,
      }),
      this.agentInsightRepository.countByUserId(userId, dateFilter),
    ]);

    return { data, total };
  }

  private buildDateFilter(
    options?: GetUserInsightsOptions,
  ): { startDate?: number; endDate?: number } | undefined {
    const { month, year, startDate, endDate } = options ?? {};

    if (month !== undefined) {
      const referenceYear = year ?? new Date().getFullYear();
      return {
        startDate: new Date(referenceYear, month - 1, 1).getTime(),
        endDate: new Date(referenceYear, month, 0, 23, 59, 59, 999).getTime(),
      };
    }

    if (startDate !== undefined || endDate !== undefined) {
      return { startDate, endDate };
    }

    return undefined;
  }
}
