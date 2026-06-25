import { IsString, IsNumber, IsNotEmpty, IsEnum, Min, Max } from 'class-validator';
import { UserGoal } from '../../domain/entities/user.entity';

export class CreateUserRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(20)
  @Max(300)
  weightKg: number;

  @IsNumber()
  @Min(50)
  @Max(280)
  heightCm: number;

  @IsNumber()
  birthDate: number;

  @IsEnum(UserGoal)
  goal: UserGoal;
}
