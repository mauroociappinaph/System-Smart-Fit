import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth.store';
import * as authApi from '@/lib/api/auth';
import type { MeResponse } from '@/lib/api/auth';

vi.mock('@/lib/api/auth', () => ({
  login: vi.fn(),
  signup: vi.fn(),
  getMe: vi.fn(),
}));

const mockUser: MeResponse = {
  id: 'user-1',
  email: 'test@fit.com',
  role: 'user',
  name: 'Test User',
  weightKg: 75,
  heightCm: 180,
  birthDate: 0,
  goal: 'Fitness',
  registeredAt: 0,
};

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    token: null,
    isLoading: false,
    error: null,
  });
  localStorage.clear();
  vi.clearAllMocks();
});

describe('auth.store', () => {
  it('login populates user + token', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'token-123',
      user: { id: 'user-1', email: 'test@fit.com', role: 'user', name: 'Test User' },
    });
    vi.mocked(authApi.getMe).mockResolvedValue(mockUser);

    const result = await useAuthStore.getState().login({ email: 'test@fit.com', password: '123456' });

    expect(result).toEqual(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().token).toBe('token-123');
    expect(localStorage.getItem('auth_token')).toBe('token-123');
  });

  it('signup populates user + token', async () => {
    vi.mocked(authApi.signup).mockResolvedValue({
      accessToken: 'token-456',
      user: { id: 'user-1', email: 'new@fit.com', role: 'user', name: 'New User' },
    });
    vi.mocked(authApi.getMe).mockResolvedValue(mockUser);

    const result = await useAuthStore.getState().signup({
      email: 'new@fit.com',
      password: '123456',
      name: 'New User',
    });

    expect(result).toEqual(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().token).toBe('token-456');
    expect(localStorage.getItem('auth_token')).toBe('token-456');
  });

  it('logout clears user + token', () => {
    useAuthStore.setState({
      user: mockUser,
      token: 'token-123',
      isLoading: false,
      error: null,
    });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('loadSession restores from localStorage', async () => {
    localStorage.setItem('auth_token', 'token-789');
    vi.mocked(authApi.getMe).mockResolvedValue(mockUser);

    await useAuthStore.getState().loadSession();

    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().token).toBe('token-789');
  });

  it('loadSession with 401 clears auth state', async () => {
    localStorage.setItem('auth_token', 'token-expired');
    vi.mocked(authApi.getMe).mockRejectedValue(new Error('Unauthorized'));

    await useAuthStore.getState().loadSession();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
