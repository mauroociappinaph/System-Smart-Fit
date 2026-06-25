import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import type { UserRepository } from '../../application/ports/out/user.repository';
import { User, UserRole, UserGoal } from '../../domain/entities/user.entity';
import { SignupRequestDto } from '../../presentation/dtos/signup.request.dto';
import { LoginRequestDto } from '../../presentation/dtos/login.request.dto';
import {
  SignupResponseDto,
  MagicLinkResponseDto,
  LoginResponseDto,
  MeResponseDto,
} from '../../presentation/dtos/auth.response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseClient: SupabaseClient,
    @Inject('SUPABASE_ADMIN_CLIENT')
    private readonly supabaseAdmin: SupabaseClient,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async signup(dto: SignupRequestDto): Promise<SignupResponseDto | MagicLinkResponseDto> {
    // Magic link flow — no password provided
    if (!dto.password) {
      const { error } = await this.supabaseClient.auth.signInWithOtp({
        email: dto.email,
      });

      if (error) {
        throw new InternalServerErrorException(error.message);
      }

      return { message: 'Magic link sent' };
    }

    // Email + password flow
    const { data: signUpData, error: signUpError } =
      await this.supabaseClient.auth.signUp({
        email: dto.email,
        password: dto.password,
      });

    if (signUpError) {
      if (signUpError.message?.toLowerCase().includes('already registered')) {
        throw new ConflictException('User already registered');
      }
      throw new InternalServerErrorException(signUpError.message);
    }

    const supabaseUserId = signUpData.user?.id;
    if (!supabaseUserId) {
      throw new InternalServerErrorException('Failed to create Supabase user');
    }

    try {
      // Set default role via admin API
      const { error: roleError } =
        await this.supabaseAdmin.auth.admin.updateUserById(supabaseUserId, {
          app_metadata: { role: UserRole.USER },
        });

      if (roleError) {
        throw new Error(`Failed to set user role: ${roleError.message}`);
      }

      // Create local profile
      const eventId = randomUUID();
      const registeredAt = Date.now();

      const { entity } = User.register(
        supabaseUserId,
        eventId,
        dto.name,
        dto.weightKg ?? 70,
        dto.heightCm ?? 170,
        dto.birthDate ?? registeredAt,
        dto.goal ?? UserGoal.MAINTAIN_FITNESS,
        UserRole.USER,
        registeredAt,
      );

      await this.userRepository.save(entity);
    } catch (error) {
      // Rollback: delete Supabase user if local profile creation fails
      await this.supabaseAdmin.auth.admin
        .deleteUser(supabaseUserId)
        .catch(() => {});

      throw error instanceof ConflictException
        ? error
        : new InternalServerErrorException(
            error instanceof Error ? error.message : 'Signup failed',
          );
    }

    // Sign in to get the access token
    const { data: sessionData, error: sessionError } =
      await this.supabaseClient.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });

    if (sessionError || !sessionData.session) {
      throw new InternalServerErrorException('Failed to obtain session');
    }

    return {
      accessToken: sessionData.session.access_token,
      user: {
        id: supabaseUserId,
        email: dto.email,
        role: UserRole.USER,
        name: dto.name,
      },
    };
  }

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const { data: authData, error: authError } =
      await this.supabaseClient.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });

    if (authError) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const supabaseUserId = authData.user?.id;
    if (!supabaseUserId || !authData.session) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Look up local profile for role and additional info
    const user = await this.userRepository.findById(supabaseUserId);

    return {
      accessToken: authData.session.access_token,
      user: {
        id: supabaseUserId,
        email: authData.user.email ?? dto.email,
        role: user?.role ?? UserRole.USER,
      },
    };
  }

  async me(userId: string): Promise<MeResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: '',
      role: user.role,
      name: user.name,
      weightKg: user.weightKg,
      heightCm: user.heightCm,
      birthDate: user.birthDate,
      goal: user.goal,
      registeredAt: user.registeredAt,
    };
  }
}
