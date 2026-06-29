import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from '../../application/ports/out/user.repository';
import { User, UserGoal, UserRole } from '../../domain/entities/user.entity';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx ?? this.prisma;

    await client.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        name: user.name,
        weightKg: user.weightKg,
        heightCm: user.heightCm,
        birthDate: user.birthDate,
        goal: user.goal,
        role: user.role,
        registeredAt: user.registeredAt,
      },
      update: {
        name: user.name,
        weightKg: user.weightKg,
        heightCm: user.heightCm,
        birthDate: user.birthDate,
        goal: user.goal,
        role: user.role,
        registeredAt: user.registeredAt,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });

    if (!record) return null;

    // Map legacy ADMIN role to USER after enum removal
    const role =
      record.role === 'ADMIN' ? UserRole.USER : (record.role as UserRole);

    return User.reconstitute({
      id: record.id,
      name: record.name,
      weightKg: record.weightKg,
      heightCm: Number(record.heightCm),
      birthDate: Number(record.birthDate),
      goal: record.goal as UserGoal,
      role,
      registeredAt: Number(record.registeredAt),
    });
  }
}
