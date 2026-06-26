import { create } from 'zustand';
import type { LoginDTO, SignupDTO, MeResponse } from '@/lib/api/auth';
import * as authApi from '@/lib/api/auth';

function extractError(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const resp = (err as { response: { data?: { message?: string } } }).response?.data;
    return resp?.message ?? fallback;
  }
  return 'Error de conexión';
}

export interface AuthState {
  user: MeResponse | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (dto: LoginDTO) => Promise<MeResponse | null>;
  signup: (dto: SignupDTO) => Promise<MeResponse | null>;
  logout: () => void;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (dto: LoginDTO) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(dto);
      localStorage.setItem('auth_token', res.accessToken);
      set({ token: res.accessToken, isLoading: false });
      // Fetch full profile instead of casting partial AuthResponse.user
      const user = await authApi.getMe();
      set({ user });
      return user;
    } catch (err: unknown) {
      const message = extractError(err, 'Credenciales inválidas');
      set({ error: message, isLoading: false });
      return null;
    }
  },

  signup: async (dto: SignupDTO) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.signup(dto);
      localStorage.setItem('auth_token', res.accessToken);
      set({ token: res.accessToken, isLoading: false });
      const user = await authApi.getMe();
      set({ user });
      return user;
    } catch (err: unknown) {
      const message = extractError(err, 'Error al registrar');
      set({ error: message, isLoading: false });
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth-storage');
    set({ user: null, token: null, error: null });
  },

  loadSession: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    set({ token, isLoading: true });
    try {
      const user = await authApi.getMe();
      set({ user, isLoading: false });
    } catch {
      localStorage.removeItem('auth_token');
      set({ token: null, user: null, isLoading: false });
    }
  },
}));
