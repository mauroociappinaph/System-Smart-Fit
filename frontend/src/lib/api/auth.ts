import api from '@/lib/axios';

export type LoginDTO = {
  email: string;
  password: string;
};

export type SignupDTO = {
  email: string;
  password?: string;
  name: string;
  weightKg?: number;
  heightCm?: number;
  birthDate?: number;
  goal?: string;
};

export type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
};

export type MeResponse = {
  id: string;
  email: string;
  role: string;
  name: string;
  weightKg: number;
  heightCm: number;
  birthDate: number;
  goal: string;
  registeredAt: number;
};

export function login(dto: LoginDTO): Promise<AuthResponse> {
  return api.post('/auth/login', dto).then((res) => res.data);
}

export function signup(dto: SignupDTO): Promise<AuthResponse> {
  return api.post('/auth/signup', dto).then((res) => res.data);
}

export function getMe(): Promise<MeResponse> {
  return api.get('/auth/me').then((res) => res.data);
}
