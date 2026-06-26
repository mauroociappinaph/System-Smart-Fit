import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../../modules/auth/decorators/public.decorator';
import { CreateUserRequestDto } from '../dtos/create-user.request.dto';
import { CreateUserService } from '../../application/use-cases/create-user.service';
import { UserRole } from '../../domain/entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: CreateUserRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ userId: string }> {
    const result = await this.createUserService.execute({
      userId: dto.userId,
      name: dto.name,
      weightKg: dto.weightKg,
      heightCm: dto.heightCm,
      birthDate: dto.birthDate,
      goal: dto.goal,
      role: UserRole.USER,
    });

    res.setHeader('Location', `/users/${result.userId}`);
    return result;
  }
}
