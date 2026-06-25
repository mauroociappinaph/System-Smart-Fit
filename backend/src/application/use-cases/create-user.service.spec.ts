import { CreateUserService } from './create-user.service';
import { UserRepository } from '../ports/out/user.repository';
import { UserGoal } from '../../domain/entities/user.entity';

describe('CreateUserService', () => {
  let service: CreateUserService;
  let mockRepository: jest.Mocked<UserRepository>;

  const validCommand = {
    name: 'John Doe',
    weightKg: 75,
    heightCm: 178,
    birthDate: 946684800000, // 2000-01-01
    goal: UserGoal.GAIN_MUSCLE,
  };

  beforeEach(() => {
    mockRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
    };

    service = new CreateUserService(mockRepository);
  });

  it('should create a user and return a userId', async () => {
    const result = await service.execute(validCommand);

    expect(result).toHaveProperty('userId');
    expect(typeof result.userId).toBe('string');
    expect(result.userId).toHaveLength(36); // UUID v4
  });

  it('should call repository.save once with the created entity', async () => {
    await service.execute(validCommand);

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    const savedUser = mockRepository.save.mock.calls[0][0];
    expect(savedUser.name).toBe(validCommand.name);
    expect(savedUser.weightKg).toBe(validCommand.weightKg);
    expect(savedUser.goal).toBe(validCommand.goal);
  });

  it('should propagate domain errors for invalid input', async () => {
    await expect(
      service.execute({ ...validCommand, name: '' }),
    ).rejects.toThrow('User: name is required');

    await expect(
      service.execute({ ...validCommand, weightKg: -1 }),
    ).rejects.toThrow('User: weightKg must be positive');
  });
});
