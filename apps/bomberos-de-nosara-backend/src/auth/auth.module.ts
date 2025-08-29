// src/auth/auth.module.ts
import { join } from 'path';
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
    // ConfigModule no es estrictamente necesario si lo tienes global,
    // pero incluirlo aquí evita problemas si cambias eso en el futuro.
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
        const from = cfg.get<string>('MAIL_FROM') ?? '"Bomberos Nosara" <no-reply@nosara.local>';
        const templateDir = join(__dirname, 'templates');

        const host = cfg.get<string>('SMTP_HOST');
        const port = Number(cfg.get('SMTP_PORT') ?? 587);
        const user = cfg.get<string>('SMTP_USER');
        const pass = cfg.get<string>('SMTP_PASS');

        const hasSmtp = !!host && !!user && !!pass;

        if (hasSmtp) {
          // Logs útiles en arranque para confirmar transporte SMTP real
          // (No imprime contraseñas ni secretos)
          console.log(`[Mailer] SMTP habilitado host=${host} port=${port} user=${user}`);
        } else {
          console.log('[Mailer] jsonTransport habilitado (no hay SMTP_* en .env): no se enviarán correos reales.');
        }

        return hasSmtp
          ? {
              transport: {
                host,
                port,
                secure: port === 465,     // TLS implícito
                auth: { user, pass },
                logger: true,             // logs de nodemailer
                debug: true,
              },
              defaults: { from },
              template: {
                dir: templateDir,
                adapter: new HandlebarsAdapter(),
                options: { strict: true },
              },
            }
          : {
              // Modo “simulado”: el mensaje aparece en logs (no sale por SMTP)
              transport: { jsonTransport: true, logger: true, debug: true },
              defaults: { from },
              template: {
                dir: templateDir,
                adapter: new HandlebarsAdapter(),
                options: { strict: true },
              },
            };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordResetService],
  exports: [AuthService, PasswordResetService],
})
export class AuthModule {}
