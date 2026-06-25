import { AuthService } from './auth.service';
import {
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserGoal, UserRole } from '../../domain/entities/user.entity';
import { User } from '../../domain/entities/user.entity';

// ── Mocks ────────────────────────────────────────────────────────────────
const mockSignUp = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignInWithOtp = jest.fn();
const mockGetUser = jest.fn();

const mockSupabaseClient = {
  auth: {
    signUp: mockSignUp,
    signInWithPassword: mockSignInWithPassword,
    signInWithOtp: mockSignInWithOtp,
    getUser: mockGetUser,
  },
} as any;

const mockUpdateUserById = jest.fn();
const mockDeleteUser = jest.fn();

const mockSupabaseAdmin = {
  auth: {
    admin: {
      updateUserById: mockUpdateUserById,
      deleteUser: mockDeleteUser,
    },
  },
} as any;

const mockSave = jest.fn();
const mockFindById = jest.fn();

const mockUserRepository = {
  save: mockSave,
  findById: mockFindById,
} as any;

// ── Helpers ──────────────────────────────────────────────────────────────
const validSignupDto = {
  email: 'new@example.com',
  password: 'secret123',
  name: 'Test User',
  weightKg: 75,
  heightCm: 180,
  birthDate: 946684800000,
  goal: UserGoal.GAIN_MUSCLE,
};

const magicLinkDto = {
  email: 'magic@example.com',
  name: 'Magic User',
};

const validLoginDto = {
  email: 'existing@example.com',
  password: 'password123',
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      mockSupabaseClient,
      mockSupabaseAdmin,
      mockUserRepository,
    );
  });

  // ─── signup: email+password flow ───────────────────────────────

  describe('signup (email + password)', () => {
    it('should create user and return accessToken + user', async () => {
      mockSignUp.mockResolvedValue({
        data: {
          user: { id: 'supabase-id-1', email: validSignupDto.email },
          session: null,
        },
        error: null,
      });
      mockUpdateUserById.mockResolvedValue({ data: { user: {} }, error: null });
      mockSave.mockResolvedValue(undefined);
      mockSignInWithPassword.mockResolvedValue({
        data: {
          session: { access_token: 'token-123' },
          user: { id: 'supabase-id-1', email: validSignupDto.email },
        },
        error: null,
      });

      const result = await service.signup(validSignupDto);

      expect(mockSignUp).toHaveBeenCalledWith({
        email: validSignupDto.email,
        password: validSignupDto.password,
      });
      expect(mockUpdateUserById).toHaveBeenCalledWith('supabase-id-1', {
        app_metadata: { role: 'USER' },
      });
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        accessToken: 'token-123',
        user: {
          id: 'supabase-id-1',
          email: validSignupDto.email,
          role: 'USER',
          name: validSignupDto.name,
        },
      });
    });

    it('should throw ConflictException when email is already registered', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' },
      });

      await expect(service.signup(validSignupDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException on signup failure', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Something went wrong' },
      });

      await expect(service.signup(validSignupDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should rollback (delete Supabase user) when local profile save fails', async () => {
      mockSignUp.mockResolvedValue({
        data: {
          user: { id: 'supabase-id-2', email: validSignupDto.email },
          session: null,
        },
        error: null,
      });
      mockUpdateUserById.mockResolvedValue({ data: { user: {} }, error: null });
      mockSave.mockRejectedValue(new Error('DB error'));
      mockDeleteUser.mockResolvedValue({ data: {}, error: null });

      await expect(service.signup(validSignupDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockDeleteUser).toHaveBeenCalledWith('supabase-id-2');
    });
  });

  // ─── signup: magic link flow ──────────────────────────────────

  describe('signup (magic link)', () => {
    it('should send magic link when no password is provided', async () => {
      mockSignInWithOtp.mockResolvedValue({ data: {}, error: null });

      const result = await service.signup(magicLinkDto as any);

      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: magicLinkDto.email,
      });
      expect(result).toEqual({ message: 'Magic link sent' });
    });

    it('should throw on magic link failure', async () => {
      mockSignInWithOtp.mockResolvedValue({
        data: {},
        error: { message: 'OTP error' },
      });

      await expect(service.signup(magicLinkDto as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ─── login ─────────────────────────────────────────────────────

  describe('login', () => {
    it('should authenticate and return accessToken + user', async () => {
      const mockUser = { role: UserRole.USER };

      mockSignInWithPassword.mockResolvedValue({
        data: {
          session: { access_token: 'login-token' },
          user: { id: 'existing-id', email: validLoginDto.email },
        },
        error: null,
      });
      mockFindById.mockResolvedValue(mockUser);

      const result = await service.login(validLoginDto);

      expect(result).toEqual({
        accessToken: 'login-token',
        user: {
          id: 'existing-id',
          email: validLoginDto.email,
          role: UserRole.USER,
        },
      });
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(service.login(validLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should default to USER role when local profile is missing', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: {
          session: { access_token: 'login-token' },
          user: { id: 'orphan-id', email: validLoginDto.email },
        },
        error: null,
      });
      mockFindById.mockResolvedValue(null);

      const result = await service.login(validLoginDto);

      expect(result.user.role).toBe(UserRole.USER);
    });
  });

  // ─── me ────────────────────────────────────────────────────────

  describe('me', () => {
    it('should return user profile when found', async () => {
      const mockUser = User.register(
        'user-1',
        'event-1',
        'Test User',
        75,
        180,
        946684800000,
        UserGoal.GAIN_MUSCLE,
        UserRole.USER,
        1700000000000,
      ).entity;

      mockFindById.mockResolvedValue(mockUser);

      const result = await service.me('user-1');

      expect(result.id).toBe('user-1');
      expect(result.name).toBe('Test User');
      expect(result.role).toBe(UserRole.USER);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockFindById.mockResolvedValue(null);

      await expect(service.me('nonexistent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
