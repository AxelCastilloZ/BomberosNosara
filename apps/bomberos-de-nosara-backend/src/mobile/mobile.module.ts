import { Module } from '@nestjs/common';
import { MobileUsersModule } from './mobile-users/mobile-users.module';
import { MobileAuthModule } from './mobile-auth/mobile-auth.module';
import { EmergencyReportsModule } from './emergency-reports/emergency-reports.module';

@Module({
  imports: [
    MobileUsersModule,
    MobileAuthModule,
    EmergencyReportsModule,
  ],
  exports: [
    MobileUsersModule,
    MobileAuthModule,
    EmergencyReportsModule,
  ],
})
export class MobileModule {}