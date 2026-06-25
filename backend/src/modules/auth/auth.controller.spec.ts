import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { UserGoal } from '../../domain/entities/user.entity';

const mockSupabaseClient = {
  auth: { getUser: jest.fn() },
} as any;

describe('AuthController', () => {
  let controller: AuthController;
  let mockService: jest.Mocked<Pick<AuthService, 'signup' | 'login' | 'me'>>;

  const signupDto = {
    email: 'test@example.com',
    password: 'secret123',
    name: 'Test User',
    weightKg: 75,
    heightCm: 180,
    birthDate: 946684800000,
    goal: UserGoal.GAIN_MUSCLE,
  };

  const loginDto = {
    email: 'test@example.com',
    password: 'secret123',
  };

  beforeEach(async () => {
    mockService = {
      signup: jest.fn(),
      login: jest.fn(),
      me: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockService },
        { provide: SupabaseClient, useValue: mockSupabaseClient },
        SupabaseAuthGuard,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('POST /auth/signup', () => {
    it('should call authService.signup and return the result', async () => {
      const expected = {
        accessToken: 'token-123',
        user: { id: 'uid', email: signupDto.email, role: 'USER' as const, name: signupDto.name },
      };
      mockService.signup.mockResolvedValue(expected as any);

      const result = await controller.signup(signupDto);

      expect(mockService.signup).toHaveBeenCalledWith(signupDto);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /auth/login', () => {
    it('should call authService.login and return the result', async () => {
      const expected = {
        accessToken: 'token-456',
        user: { id: 'uid', email: loginDto.email, role: 'USER' as const },
      };
      mockService.login.mockResolvedValue(expected as any);

      const result = await controller.login(loginDto);

      expect(mockService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expected);
    });
  });

  describe('GET /auth/me', () => {
    it('should call authService.me with current user sub', async () => {
      const currentUser = { sub: 'user-1', email: 'test@example.com', role: 'USER' };
      const expected = {
        id: 'user-1',
        email: '',
        role: 'USER' as const,
        name: 'Test User',
        weightKg: 75,
        heightCm: 180,
        birthDate: 946684800000,
        goal: 'GAIN_MUSCLE',
        registeredAt: 1700000000000,
      };
      mockService.me.mockResolvedValue(expected);

      const result = await controller.me(currentUser);

      expect(mockService.me).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expected);
    });
  });
});
