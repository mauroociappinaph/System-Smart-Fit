import { RecordStateTransitionCommand } from './record-state-transition.command';
import { UserStateTransitioned } from '../../../domain/events/user-state-transitioned.event';

export interface RecordStateTransitionUseCase {
  execute(
    command: RecordStateTransitionCommand,
  ): Promise<{ entityId: string; event: UserStateTransitioned }>;
}
