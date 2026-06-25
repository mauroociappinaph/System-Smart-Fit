import { Module } from '@nestjs/common';
import { UserController } from '../../presentation/controllers/user.controller';
import { CreateUserService } from '../../application/use-cases/create-user.service';
import { UserPrismaRepository } from '../../infrastructure/persistence/user-prisma.repository';

@Module({
  controllers: [UserController],
  providers: [
    CreateUserService,
    {
      provide: 'UserRepository',
      useClass: UserPrismaRepository,
    },
  ],
})
export class UserModule {}
