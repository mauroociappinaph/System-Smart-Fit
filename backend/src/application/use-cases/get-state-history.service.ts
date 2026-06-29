import { Injectable, Inject } from '@nestjs/common';
import { GetStateHistoryUseCase } from '../ports/in/get-state-history.use-case';
import type { UserStateRepository } from '../ports/out/user-state.repository';
import { UserState } from '../../domain/entities/user-state.entity';

@Injectable()
export class GetStateHistoryService implements GetStateHistoryUseCase {
  constructor(
    @Inject('UserStateRepository')
    private readonly userStateRepository: UserStateRepository,
  ) {}

  async execute(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<{ data: UserState[]; total: number }> {
    const [data, total] = await Promise.all([
      this.userStateRepository.findHistoryByUserId(userId, options),
      this.userStateRepository.countHistoryByUserId(userId),
    ]);

    return { data, total };
  }
}
