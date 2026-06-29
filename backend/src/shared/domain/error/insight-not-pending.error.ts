import { DomainError } from './domain.error';

export class InsightNotPendingError extends DomainError {
  constructor() {
    super(
      'AgentInsight is not in PENDING status',
      'INSIGHT_NOT_PENDING',
    );
  }
}
