
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';

import { ResetThrottleGuard } from './../common/guards/reset-throttle.guard';
import { RolesGuard } from './../common/guards/roles.guard';
import { JwtAuthGuard } from './../common/guards/jwt-auth.guard';
import { LoginThrottleGuard } from './../common/guards/login-throttle.guard';
import { ThrottlerBehindProxyGuard } from './../common/guards/throttler-behind-proxy.guard';
import { WsJwtGuard } from './../common/guards/ws-jwt.guard'; 

@Module({
  imports: [
    ConfigModule,   
    JwtModule,      
    ThrottlerModule,
  ],
  providers: [
    ResetThrottleGuard,
    LoginThrottleGuard,
    RolesGuard,
    JwtAuthGuard,
    ThrottlerBehindProxyGuard,
    WsJwtGuard,    
  ],
  exports: [
    ResetThrottleGuard,
    RolesGuard,
    JwtAuthGuard,
    ThrottlerBehindProxyGuard,
    WsJwtGuard,   
  ],
})
export class GuardsModule {}
