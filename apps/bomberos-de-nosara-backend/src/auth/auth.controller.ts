// src/auth/auth.controller.ts
import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Throttle, minutes } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { PasswordResetService } from './password-reset.service';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetThrottleGuard } from '../common/guards/reset-throttle.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordReset: PasswordResetService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('request-password-reset')
  @UseGuards(ResetThrottleGuard)
  @Throttle({ reset: { limit: 3, ttl: minutes(15) } }) // <- en v5 va un objeto
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto, @Req() req: any) {
    const appBaseUrl = process.env.APP_BASE_URL ?? 'http://localhost:5173';

    // Si hay proxy delante, recuerda app.set('trust proxy', 1) en main.ts
    const ip = Array.isArray(req.ips) && req.ips.length ? req.ips[0] : req.ip;
    const ua = (req.headers['user-agent'] as string) || undefined;

    await this.passwordReset.sendResetEmail(dto.email, appBaseUrl, { ip, ua });
    return { message: 'Si la cuenta existe, se enviaron instrucciones para restablecer la contraseña.' };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.passwordReset.consumeResetToken(dto.token, dto.newPassword);
    return { message: 'Contraseña actualizada correctamente' };
  }
}
