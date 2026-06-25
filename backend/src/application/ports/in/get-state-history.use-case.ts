import { UserState } from '../../../domain/entities/user-state.entity';

export interface GetStateHistoryUseCase {
  execute(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<{ data: UserState[]; total: number }>;
}
