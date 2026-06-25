import { UserState } from '../../../domain/entities/user-state.entity';

export interface GetCurrentStateUseCase {
  execute(userId: string): Promise<UserState | null>;
}
