import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { MobileAuthService } from './mobile-auth.service';
import { CreateAnonymousDto } from './dto/create-anonymous.dto';
import { DeviceLoginDto } from './dto/device-login.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { LoginCitizenDto } from './dto/login-citizen.dto';
import { RegisterCitizenDto } from './dto/register-citizen.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('mobile/auth')
export class MobileAuthController {
  constructor(private readonly mobileAuthService: MobileAuthService) {}

  @Post('anonymous')
  async createAnonymous(@Body() dto: CreateAnonymousDto) {
    return this.mobileAuthService.createAnonymousUser(dto);
  }

  @Post('device')
  async loginWithDevice(@Body() dto: DeviceLoginDto) {
    return this.mobileAuthService.loginWithDevice(dto);
  }

  @Post('register')
  async register(@Body() dto: RegisterCitizenDto) {
    return this.mobileAuthService.registerCitizen(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginCitizenDto) {
    return this.mobileAuthService.loginCitizen(dto.email, dto.password);
  }

  @Post('complete-profile')
  @UseGuards(JwtAuthGuard)
  async completeProfile(@Request() req: any, @Body() dto: CompleteProfileDto) {
    const mobileUserId = req.user.sub;
    return this.mobileAuthService.completeProfile(mobileUserId, dto);
  }
}