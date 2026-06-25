import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateUserRequestDto } from '../dtos/create-user.request.dto';
import { CreateUserService } from '../../application/use-cases/create-user.service';

@Controller('users')
export class UserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: CreateUserRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ userId: string }> {
    const result = await this.createUserService.execute({
      name: dto.name,
      weightKg: dto.weightKg,
      heightCm: dto.heightCm,
      birthDate: dto.birthDate,
      goal: dto.goal,
    });

    res.setHeader('Location', `/users/${result.userId}`);
    return result;
  }
}
