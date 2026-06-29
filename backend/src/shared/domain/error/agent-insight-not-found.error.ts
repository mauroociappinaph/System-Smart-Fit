import { DomainError } from './domain.error';

export class AgentInsightNotFoundError extends DomainError {
  constructor(insightId: string) {
    super(
      `AgentInsight with id "${insightId}" not found`,
      'AGENT_INSIGHT_NOT_FOUND',
    );
  }
}
