// src/auth/password-reset.service.ts
import {
  Injectable, BadRequestException, Logger, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import * as crypto from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

import { PasswordResetToken } from './entities/password-reset-token.entity';
import { UsersService } from '../users/users.service';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  private readonly TOKEN_EXPIRY_MINUTES = 30;

  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly tokenRepo: Repository<PasswordResetToken>,
    private readonly users: UsersService,
    private readonly mailer: MailerService,
    private readonly cfg: ConfigService,
  ) {}

  /**
   * Solicitar reset de contraseña - envía email con token
   */
  async requestPasswordReset(dto: PasswordResetRequestDto): Promise<void> {
    this.logger.debug(`Solicitud de reset para email: ${dto.email}`);

    // Buscar usuario
    const user = await this.users.findByEmail(dto.email);
    if (!user) {
      // Por seguridad, no revelamos si el email existe
      this.logger.warn(`Email no encontrado: ${dto.email} (respondemos OK)`);
      return;
    }

    // Cancelar tokens anteriores del usuario
    await this.tokenRepo.delete({ 
      userId: user.id, 
      consumedAt: IsNull() 
    });

    // Generar nuevo token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_MINUTES * 60 * 1000);

    // Guardar token en BD
    const tokenEntity = this.tokenRepo.create({
      userId: user.id,
      token,
      expiresAt,
    });
    await this.tokenRepo.save(tokenEntity);

    this.logger.log(`Token generado para ${dto.email}, expira: ${expiresAt.toISOString()}`);

    // Enviar email
    await this.sendResetEmail(dto.email, token, user.username);
  }

  /**
   * Confirmar reset - valida token y cambia contraseña
   */
  async confirmPasswordReset(dto: PasswordResetConfirmDto): Promise<void> {
    this.logger.debug(`Confirmando reset con token: ${dto.token.substring(0, 8)}...`);

    const now = new Date();

    // Buscar token válido
    const tokenEntity = await this.tokenRepo.findOne({
      where: { 
        token: dto.token, 
        consumedAt: IsNull(), 
        expiresAt: MoreThan(now) 
      },
    });

    if (!tokenEntity) {
      this.logger.warn(`Token inválido/expirado: ${dto.token.substring(0, 8)}...`);
      throw new BadRequestException('Token inválido o expirado');
    }

    // Actualizar contraseña del usuario
    await this.users.updatePassword(tokenEntity.userId, dto.newPassword);

    // Marcar token como consumido
    tokenEntity.consumedAt = new Date();
    await this.tokenRepo.save(tokenEntity);

    this.logger.log(`Reset completado para userId: ${tokenEntity.userId}`);
  }

  /**
   * Validar si un token es válido (útil para el frontend)
   */
  async validateToken(token: string): Promise<{ valid: boolean; expired?: boolean }> {
    const now = new Date();

    const tokenEntity = await this.tokenRepo.findOne({
      where: { token, consumedAt: IsNull() },
    });

    if (!tokenEntity) {
      return { valid: false };
    }

    const expired = tokenEntity.expiresAt <= now;
    return { 
      valid: !expired, 
      expired 
    };
  }

  /**
   * Enviar email de reset (método privado)
   */
  private async sendResetEmail(email: string, token: string, username: string): Promise<void> {
    const baseUrl = this.cfg.get<string>('FRONTEND_URL', 'http://localhost:5173');
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc3545;">Bomberos Voluntarios de Nosara</h1>
        </div>
        
        <h2 style="color: #333;">Restablecer Contraseña</h2>
        
        <p>Hola <strong>${username}</strong>,</p>
        
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Restablecer Contraseña
          </a>
        </div>
        
        <p><strong>Este enlace expirará en ${this.TOKEN_EXPIRY_MINUTES} minutos.</strong></p>
        
        <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="font-size: 12px; color: #666; text-align: center;">
          Bomberos Voluntarios de Nosara<br>
          Este es un email automático, por favor no respondas.
        </p>
      </div>
    `;

    try {
      await this.mailer.sendMail({
        to: email,
        subject: 'Restablecer contraseña - Bomberos Nosara',
        html: htmlContent,
      });

      this.logger.log(`Email de reset enviado a: ${email}`);
    }  catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
  this.logger.error(`Error enviando email a ${email}: ${errorMessage}`);
      
      // En desarrollo, mostrar link en consola
      if (process.env.NODE_ENV !== 'production') {
        this.logger.warn(`=== LINK DE DESARROLLO ===`);
        this.logger.warn(`Reset link: ${resetUrl}`);
        this.logger.warn(`========================`);
      }
    }
  }
}