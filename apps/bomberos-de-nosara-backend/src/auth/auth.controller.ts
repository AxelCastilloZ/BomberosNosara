import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';

import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly reset: PasswordResetService,
    private readonly cfg: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestReset(@Body() dto: RequestPasswordResetDto) {
    const appBaseUrl =
      dto.appBaseUrl ??
      this.cfg.get<string>('APP_BASE_URL') ??
      this.cfg.get<string>('FRONTEND_URL') ??
      'http://localhost:5173';

    await this.reset.sendResetEmail(dto.email, appBaseUrl);
    return { ok: true };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.reset.consumeResetToken(dto.token, dto.newPassword);
    return { ok: true };
  }
}
