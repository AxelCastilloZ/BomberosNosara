import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { Throttle, minutes } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto';

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
  @Throttle({ default: { limit: 3, ttl: minutes(15) } })
  async requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
    await this.passwordReset.requestPasswordReset(dto);
    return { 
      message: 'Si la cuenta existe, se enviaron instrucciones para restablecer la contraseña.' 
    };
  }

  @Post('reset-password')  // <-- CAMBIÉ AQUÍ: de 'confirm-password-reset' a 'reset-password'
  async resetPassword(@Body() dto: PasswordResetConfirmDto) {
    await this.passwordReset.confirmPasswordReset(dto);
    return { 
      message: 'Contraseña actualizada correctamente' 
    };
  }

  @Get('validate-reset-token/:token')
  async validateResetToken(@Param('token') token: string) {
    const result = await this.passwordReset.validateToken(token);
    return result;
  }
}