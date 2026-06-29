import { Injectable, Inject } from '@nestjs/common';
import { GetCurrentStateUseCase } from '../ports/in/get-current-state.use-case';
import type { UserStateRepository } from '../ports/out/user-state.repository';
import { UserState } from '../../domain/entities/user-state.entity';

@Injectable()
export class GetCurrentStateService implements GetCurrentStateUseCase {
  constructor(
    @Inject('UserStateRepository')
    private readonly userStateRepository: UserStateRepository,
  ) {}

  async execute(userId: string): Promise<UserState | null> {
    return this.userStateRepository.findCurrentByUserId(userId);
  }
}
