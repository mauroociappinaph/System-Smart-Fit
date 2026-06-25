import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStateRepository } from '../../../application/ports/out/user-state.repository';
import {
  UserState,
  UserStateEnum,
} from '../../../domain/entities/user-state.entity';

@Injectable()
export class UserStatePrismaRepository implements UserStateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(state: UserState): Promise<void> {
    await this.prisma.userState.create({
      data: {
        id: state.id,
        userId: state.userId,
        currentState: state.currentState,
        previousState: state.previousState,
        transitionedAt: state.transitionedAt,
        correlationId: state.correlationId,
      },
    });
  }

  async findById(id: string): Promise<UserState | null> {
    const record = await this.prisma.userState.findUnique({ where: { id } });
    if (!record) return null;

    if (record.deletedAt) return null;

    return this.toDomain(record);
  }

  async findCurrentByUserId(userId: string): Promise<UserState | null> {
    const record = await this.prisma.userState.findFirst({
      where: { userId, deletedAt: null },
      orderBy: { transitionedAt: 'desc' },
    });
    if (!record) return null;

    return this.toDomain(record);
  }

  async findHistoryByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<UserState[]> {
    const records = await this.prisma.userState.findMany({
      where: { userId, deletedAt: null },
      orderBy: { transitionedAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });

    return records.map((r) => this.toDomain(r));
  }

  async countHistoryByUserId(userId: string): Promise<number> {
    return this.prisma.userState.count({
      where: { userId, deletedAt: null },
    });
  }

  private toDomain(record: {
    id: string;
    userId: string;
    currentState: string;
    previousState: string | null;
    transitionedAt: bigint;
    correlationId: string;
  }): UserState {
    return UserState.reconstitute(
      record.id,
      record.userId,
      record.currentState as UserStateEnum,
      record.previousState as UserStateEnum | null,
      Number(record.transitionedAt),
      record.correlationId,
    );
  }
}
