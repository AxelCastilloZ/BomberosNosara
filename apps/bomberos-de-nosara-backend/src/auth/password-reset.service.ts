// src/auth/password-reset.service.ts
import {
  Injectable, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import * as crypto from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

import { PasswordResetToken } from './entities/password-reset-token.entity';
import { UsersService } from '../users/users.service';

interface ResetEmailContext {
  name: string;
  resetUrl: string;
  expiresIn: string;
}

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly tokenRepo: Repository<PasswordResetToken>,
    private readonly users: UsersService,
    private readonly mailer: MailerService,
    private readonly cfg: ConfigService,
  ) {}

 
  async sendResetEmail(
    email: string,
    appBaseUrl: string,
    clientInfo?: { ip?: string; ua?: string },
  ): Promise<void> {
    this.logger.debug(
      `Solicitud de reset para email=${email} ip=${clientInfo?.ip ?? '-'} ua=${clientInfo?.ua ?? '-'}`,
    );

    const user = await this.users.findByEmail(email);
    if (!user) {
   
      this.logger.warn(`Email NO encontrado en DB: ${email} (respondemos 200 igual)`);
      return;
    }

    
    await this.tokenRepo.delete({ userId: user.id, consumedAt: IsNull() });

   
    const token = crypto.randomBytes(32).toString('hex');
    const minutes = Number(this.cfg.get('RESET_TTL_MINUTES') ?? 30);
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

    const entity = this.tokenRepo.create({ userId: user.id, token, expiresAt });
    await this.tokenRepo.save(entity);
    this.logger.log(`Token generado para ${email}, expira en ${expiresAt.toISOString()}`);

    
    const base = (appBaseUrl || '').replace(/\/+$/, '');
    const resetUrl = `${base}/reset-password?token=${token}`;
    this.logger.debug(`Reset link: ${resetUrl}`);

    
    const name =
      (user as any).name ??
      (user as any).username ??
      (email.includes('@') ? email.split('@')[0] : email);

    const context: ResetEmailContext = {
      name,
      resetUrl,
      expiresIn: `${minutes} minutos`,
    };

    try {
      const info = await this.mailer.sendMail({
        to: email,
        subject: 'Restablecer contraseña',
        template: 'password-reset', 
        context,
      });

      const messageId = (info as any)?.messageId ?? 'n/a';
      this.logger.log(`Email de reset enviado a ${email} messageId=${messageId}`);
      this.logger.debug(`Mailer info: ${JSON.stringify(info)}`);
    } catch (err) {
     
      this.logger.error(`Fallo al enviar email de reset a ${email}: ${String(err)}`);
    }
  }

  
  async consumeResetToken(token: string, newPassword: string): Promise<void> {
    const now = new Date();

    const row = await this.tokenRepo.findOne({
      where: { token, consumedAt: IsNull(), expiresAt: MoreThan(now) },
    });

    if (!row) {
      this.logger.warn(`Token inválido/expirado: ${token.substring(0, 8)}…`);
      throw new BadRequestException('Token inválido o expirado');
    }

    await this.users.updatePassword(row.userId, newPassword);

    row.consumedAt = new Date();
    await this.tokenRepo.save(row);

    this.logger.log(`Token consumido OK para userId=${row.userId}`);
  }
}
