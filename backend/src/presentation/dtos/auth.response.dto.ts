export interface UserDto {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  name?: string;
}

export interface SignupResponseDto {
  accessToken: string;
  user: UserDto;
}

export interface MagicLinkResponseDto {
  message: string;
}

export interface LoginResponseDto {
  accessToken: string;
  user: UserDto;
}

export interface MeResponseDto {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  name: string;
  weightKg: number;
  heightCm: number;
  birthDate: number;
  goal: string;
  registeredAt: number;
}
