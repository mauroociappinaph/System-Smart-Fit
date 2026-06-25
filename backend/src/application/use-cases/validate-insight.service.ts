import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { ValidateInsightUseCase, ValidationAction } from '../ports/in/validate-insight.use-case';
import { AgentInsightRepository } from '../ports/out/agent-insight.repository';
import { AgentInsight, NOT_PENDING_ERROR } from '../../domain/entities/agent-insight.entity';

@Injectable()
export class ValidateInsightService implements ValidateInsightUseCase {
  constructor(
    @Inject('AgentInsightRepository')
    private readonly agentInsightRepository: AgentInsightRepository,
  ) {}

  async execute(insightId: string, action: ValidationAction): Promise<AgentInsight> {
    const insight = await this.agentInsightRepository.findById(insightId);

    if (!insight) {
      throw new NotFoundException(`AgentInsight with id "${insightId}" not found`);
    }

    try {
      switch (action) {
        case 'approve':
          insight.approve();
          break;
        case 'reject':
          insight.reject();
          break;
        case 'discard':
          insight.discard();
          break;
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === NOT_PENDING_ERROR
      ) {
        throw new ConflictException(error.message);
      }
      throw error;
    }

    await this.agentInsightRepository.save(insight);

    return insight;
  }
}
