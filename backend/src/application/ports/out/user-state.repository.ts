import { Prisma } from '@prisma/client';
import { UserState } from '../../../domain/entities/user-state.entity';

export interface UserStateRepository {
  save(state: UserState, tx?: Prisma.TransactionClient): Promise<void>;

  findById(id: string): Promise<UserState | null>;

  findCurrentByUserId(userId: string): Promise<UserState | null>;

  findHistoryByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<UserState[]>;

  countHistoryByUserId(userId: string): Promise<number>;
}
