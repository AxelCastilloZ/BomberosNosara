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

function resolveTemplateDir(): string {
  const distTpl = join(__dirname, 'templates');                              // dist/auth/templates
  if (existsSync(distTpl)) return distTpl;
  const srcNeighbor = join(__dirname, '..', 'templates');                    // src/auth/templates (dev)
  if (existsSync(srcNeighbor)) return srcNeighbor;
  const monoTpl = join(process.cwd(), 'apps', 'bomberos-de-nosara-backend', 'src', 'auth', 'templates');
  if (existsSync(monoTpl)) return monoTpl;
  const simpleTpl = join(process.cwd(), 'src', 'auth', 'templates');
  if (existsSync(simpleTpl)) return simpleTpl;
  return distTpl;
}

@Module({
  imports: [
    ConfigModule,
    UsersModule,
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
        const from = cfg.get<string>('MAIL_FROM') ?? '"Bomberos Nosara" <no-reply@nosara.local>';
        const host = cfg.get<string>('SMTP_HOST');
        const port = Number(cfg.get('SMTP_PORT') ?? 587);
        const user = cfg.get<string>('SMTP_USER');
        const pass = cfg.get<string>('SMTP_PASS');
        const hasSmtp = Boolean(host && user && pass);

        const templateDir = resolveTemplateDir();
        console.log('[Mailer] templates dir:', templateDir);

        const base = {
          defaults: { from },
          template: { dir: templateDir, adapter: new HandlebarsAdapter(), options: { strict: true } },
        } as const;

        return hasSmtp
          ? { ...base, transport: { host, port, secure: port === 465, auth: { user, pass }, logger: true, debug: true } }
          : { ...base, transport: { jsonTransport: true, logger: true, debug: true } };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordResetService],
  exports: [AuthService, PasswordResetService],
})
export class AuthModule {}
