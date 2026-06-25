import { Test, TestingModule } from '@nestjs/testing';
import { UserPrismaRepository } from './user-prisma.repository';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserGoal, UserRole } from '../../domain/entities/user.entity';

describe('UserPrismaRepository', () => {
  let repository: UserPrismaRepository;
  let prismaService: { user: { create: jest.Mock; findUnique: jest.Mock } };

  const mockRecord = {
    id: 'user-id-1',
    name: 'John Doe',
    weightKg: 75,
    heightCm: 178,
    birthDate: BigInt(946684800000),
    goal: UserGoal.GAIN_MUSCLE,
    role: UserRole.USER,
    registeredAt: BigInt(1700000000000),
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        create: jest.fn().mockResolvedValue(undefined),
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPrismaRepository,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    repository = module.get<UserPrismaRepository>(UserPrismaRepository);
  });

  describe('save', () => {
    it('should call prisma.user.create with correct data', async () => {
      const { entity } = User.register(
        mockRecord.id,
        'event-id-1',
        mockRecord.name,
        mockRecord.weightKg,
        mockRecord.heightCm,
        Number(mockRecord.birthDate),
        mockRecord.goal,
        mockRecord.role,
        Number(mockRecord.registeredAt),
      );

      await repository.save(entity);

      expect(prismaService.user.create).toHaveBeenCalledTimes(1);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          id: mockRecord.id,
          name: mockRecord.name,
          weightKg: mockRecord.weightKg,
          heightCm: mockRecord.heightCm,
          birthDate: Number(mockRecord.birthDate),
          goal: mockRecord.goal,
          role: mockRecord.role,
          registeredAt: Number(mockRecord.registeredAt),
        },
      });
    });
  });

  describe('findById', () => {
    it('should return null when user does not exist', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      const result = await repository.findById('nonexistent');
      expect(result).toBeNull();
    });

    it('should reconstitute and return a User entity when found', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockRecord);
      const result = await repository.findById(mockRecord.id);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(mockRecord.id);
      expect(result!.name).toBe(mockRecord.name);
      expect(result!.goal).toBe(mockRecord.goal);
      expect(result!.role).toBe(mockRecord.role);
    });
  });
});
