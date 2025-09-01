// src/auth/auth.module.ts
import { join } from 'path';
import { existsSync } from 'fs';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategies';
import { UsersModule } from '../users/users.module';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    GuardsModule,
    TypeOrmModule.forFeature([PasswordResetToken]),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),

    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const from =
          cfg.get<string>('MAIL_FROM') ??
          '"Bomberos Nosara" <no-reply@nosara.local>';

        // Plantillas: usa dist en runtime; si no existe, cae a src (dev)
        const distDir = join(__dirname, 'templates'); // dist/auth/templates
        const srcDir = join(
          process.cwd(),
          'apps',
          'bomberos-de-nosara-backend',
          'src',
          'auth',
          'templates',
        );
        const templateDir = existsSync(distDir) ? distDir : srcDir;

        const host = cfg.get<string>('SMTP_HOST');
        const port = Number(cfg.get('SMTP_PORT') ?? 587);
        const user = cfg.get<string>('SMTP_USER');
        const pass = cfg.get<string>('SMTP_PASS');

        const useSmtp = !!host && !!user && !!pass;

        const common = {
          defaults: { from },
          template: {
            dir: templateDir,
            adapter: new HandlebarsAdapter(),
            options: { strict: true },
          },
        } as const;

        if (!useSmtp) {
          console.log(
            '[Mailer] jsonTransport habilitado (faltan variables SMTP_*). No se enviarán correos reales.',
          );
          return {
            transport: { jsonTransport: true, logger: true, debug: true },
            ...common,
          };
        }

        console.log(
          `[Mailer] SMTP habilitado host=${host} port=${port} user=${user}`,
        );
        return {
          transport: {
            host,
            port,
            secure: port === 465, 
            auth: { user, pass },
            logger: true,
            debug: true,
          },
          ...common,
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordResetService],
  exports: [AuthService, PasswordResetService],
})
export class AuthModule {}
