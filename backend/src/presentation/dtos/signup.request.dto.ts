import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsEnum,
  MinLength,
} from 'class-validator';
import { UserGoal } from '../../domain/entities/user.entity';

export class SignupRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(280)
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  birthDate?: number;

  @IsOptional()
  @IsEnum(UserGoal)
  goal?: UserGoal;
}
