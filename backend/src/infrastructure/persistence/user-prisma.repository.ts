import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from '../../application/ports/out/user.repository';
import { User, UserGoal } from '../../domain/entities/user.entity';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        weightKg: user.weightKg,
        heightCm: user.heightCm,
        birthDate: user.birthDate,
        goal: user.goal,
        registeredAt: user.registeredAt,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });

    if (!record) return null;

    const { entity } = User.register(
      record.id,
      'reconstitution',
      record.name,
      record.weightKg,
      Number(record.heightCm),
      Number(record.birthDate),
      record.goal as UserGoal,
      Number(record.registeredAt),
    );

    return entity;
  }
}
