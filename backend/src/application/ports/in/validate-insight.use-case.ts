import { AgentInsight } from '../../../domain/entities/agent-insight.entity';

export type ValidationAction = 'approve' | 'reject' | 'discard';

export interface ValidateInsightUseCase {
  execute(insightId: string, action: ValidationAction): Promise<AgentInsight>;
}
