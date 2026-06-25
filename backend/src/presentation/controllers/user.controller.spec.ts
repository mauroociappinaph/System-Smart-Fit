import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { CreateUserService } from '../../application/use-cases/create-user.service';
import { UserGoal } from '../../domain/entities/user.entity';

describe('UserController', () => {
  let controller: UserController;
  let mockService: jest.Mocked<Pick<CreateUserService, 'execute'>>;

  const mockDto = {
    name: 'Jane Doe',
    weightKg: 60,
    heightCm: 165,
    birthDate: 946684800000,
    goal: UserGoal.LOSE_WEIGHT,
  };

  beforeEach(async () => {
    mockService = {
      execute: jest.fn().mockResolvedValue({ userId: 'generated-uuid' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: CreateUserService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should call service.execute with mapped command and return userId', async () => {
    const mockRes = { setHeader: jest.fn() } as any;
    const result = await controller.register(mockDto as any, mockRes);

    expect(mockService.execute).toHaveBeenCalledWith({
      name: mockDto.name,
      weightKg: mockDto.weightKg,
      heightCm: mockDto.heightCm,
      birthDate: mockDto.birthDate,
      goal: mockDto.goal,
    });
    expect(result).toEqual({ userId: 'generated-uuid' });
  });

  it('should set Location header with the new user URI', async () => {
    const mockRes = { setHeader: jest.fn() } as any;
    await controller.register(mockDto as any, mockRes);

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Location',
      '/users/generated-uuid',
    );
  });
});
