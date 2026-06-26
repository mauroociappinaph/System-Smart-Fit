import { create } from 'zustand';
import type { LoginDTO, SignupDTO, MeResponse } from '@/lib/api/auth';
import * as authApi from '@/lib/api/auth';

export interface AuthState {
  user: MeResponse | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (dto: LoginDTO) => Promise<void>;
  signup: (dto: SignupDTO) => Promise<void>;
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
      set({ token: res.accessToken, user: res.user as MeResponse, isLoading: false });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data?: { message?: string } } }).response?.data
              ?.message || 'Credenciales inválidas'
          : 'Error de conexión';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  signup: async (dto: SignupDTO) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.signup(dto);
      localStorage.setItem('auth_token', res.accessToken);
      set({ token: res.accessToken, user: res.user as MeResponse, isLoading: false });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data?: { message?: string } } }).response?.data
              ?.message || 'Error al registrar'
          : 'Error de conexión';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
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
