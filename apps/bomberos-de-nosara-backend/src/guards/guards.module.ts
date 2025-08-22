
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { ResetThrottleGuard } from './../common/guards/reset-throttle.guard';
import { RolesGuard } from './../common/guards/roles.guard';
import { JwtAuthGuard } from './../common/guards/jwt-auth.guard';
import { LoginThrottleGuard } from './../common/guards/login-throttle.guard';

import { ThrottlerBehindProxyGuard } from './../common/guards/throttler-behind-proxy.guard';

@Module({
  imports: [
    
    ThrottlerModule,
  ],
  providers: [
    ResetThrottleGuard,
    LoginThrottleGuard,
    RolesGuard,
    JwtAuthGuard,
    ThrottlerBehindProxyGuard, 
  ],
  exports: [
    ResetThrottleGuard,
    RolesGuard,
    JwtAuthGuard,
    ThrottlerBehindProxyGuard, 
  ],
})
export class GuardsModule {}
