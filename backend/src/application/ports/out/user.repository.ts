import { Prisma } from '@prisma/client';
import { User } from '../../../domain/entities/user.entity';

export interface UserRepository {
  save(user: User, tx?: Prisma.TransactionClient): Promise<void>;
  findById(id: string): Promise<User | null>;
}
