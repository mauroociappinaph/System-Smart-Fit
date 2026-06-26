import { CreateUserService } from './create-user.service';
import { UserRepository } from '../ports/out/user.repository';
import { UserGoal, UserRole } from '../../domain/entities/user.entity';

describe('CreateUserService', () => {
  let service: CreateUserService;
  let mockRepository: jest.Mocked<UserRepository>;

  const validCommand = {
    userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'John Doe',
    weightKg: 75,
    heightCm: 178,
    birthDate: 946684800000, // 2000-01-01
    goal: UserGoal.GAIN_MUSCLE,
    role: UserRole.USER,
  };

  beforeEach(() => {
    mockRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
    };

    service = new CreateUserService(mockRepository);
  });

  it('should create a user and return the userId from command', async () => {
    const result = await service.execute(validCommand);

    expect(result).toHaveProperty('userId');
    expect(result.userId).toBe(validCommand.userId);
  });

  it('should call repository.save once with the created entity', async () => {
    await service.execute(validCommand);

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    const savedUser = mockRepository.save.mock.calls[0][0];
    expect(savedUser.name).toBe(validCommand.name);
    expect(savedUser.weightKg).toBe(validCommand.weightKg);
    expect(savedUser.goal).toBe(validCommand.goal);
    expect(savedUser.role).toBe(validCommand.role);
  });

  it('should propagate domain errors for invalid input', async () => {
    await expect(
      service.execute({ ...validCommand, name: '' }),
    ).rejects.toThrow('User: name is required');

    await expect(
      service.execute({ ...validCommand, weightKg: -1 }),
    ).rejects.toThrow('User: weightKg must be positive');
  });

  it('should propagate domain error for invalid role', async () => {
    await expect(
      service.execute({ ...validCommand, role: 'INVALID' as UserRole }),
    ).rejects.toThrow('User: invalid role "INVALID"');
  });
});
