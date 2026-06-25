import { Injectable, Inject } from '@nestjs/common';
import { GetUserInsightsUseCase } from '../ports/in/get-user-insights.use-case';
import { AgentInsightRepository } from '../ports/out/agent-insight.repository';
import { AgentInsight } from '../../domain/entities/agent-insight.entity';

@Injectable()
export class GetUserInsightsService implements GetUserInsightsUseCase {
  constructor(
    @Inject('AgentInsightRepository')
    private readonly agentInsightRepository: AgentInsightRepository,
  ) {}

  async execute(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<{ data: AgentInsight[]; total: number }> {
    const [data, total] = await Promise.all([
      this.agentInsightRepository.findByUserId(userId, options),
      this.agentInsightRepository.countByUserId(userId),
    ]);

    return { data, total };
  }
}
