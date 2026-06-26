import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { SignupRequestDto } from '../../presentation/dtos/signup.request.dto';
import { LoginRequestDto } from '../../presentation/dtos/login.request.dto';
import {
  SignupResponseDto,
  MagicLinkResponseDto,
  LoginResponseDto,
  MeResponseDto,
} from '../../presentation/dtos/auth.response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() dto: SignupRequestDto,
  ): Promise<SignupResponseDto | MagicLinkResponseDto> {
    return this.authService.signup(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(
    @CurrentUser() user: { sub: string; email: string; role: string },
  ): Promise<MeResponseDto> {
    return this.authService.me(user.sub);
  }
}
