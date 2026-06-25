import { UserStateEnum } from '../../../domain/entities/user-state.entity';

export interface RecordStateTransitionCommand {
  readonly userId: string;
  readonly currentState: UserStateEnum;
  readonly previousState: UserStateEnum | null;
  readonly correlationId?: string;
}
