import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MobileAuthService } from './mobile-auth.service';
import { MobileAuthController } from './mobile-auth.controller';
import { MobileUsersModule } from '../mobile-users/mobile-users.module';
import { UsersModule } from '../../users/users.module'; // ← NUEVO
import { GuardsModule } from '../../guards/guards.module';

@Module({
  imports: [
    ConfigModule,
    MobileUsersModule,
    UsersModule, // ← AGREGAR AQUÍ
    GuardsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [MobileAuthController],
  providers: [MobileAuthService],
  exports: [MobileAuthService],
})
export class MobileAuthModule {}