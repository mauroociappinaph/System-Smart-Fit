import { UserState } from '../../../domain/entities/user-state.entity';

export interface UserStateRepository {
  save(state: UserState): Promise<void>;

  findById(id: string): Promise<UserState | null>;

  findCurrentByUserId(userId: string): Promise<UserState | null>;

  findHistoryByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<UserState[]>;

  countHistoryByUserId(userId: string): Promise<number>;
}
