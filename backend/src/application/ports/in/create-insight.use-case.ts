import { CreateInsightCommand } from './create-insight.command';
import { InsightGenerated } from '../../../domain/events/insight-generated.event';

export interface CreateInsightUseCase {
  execute(
    command: CreateInsightCommand,
  ): Promise<{ entityId: string; event: InsightGenerated }>;
}
