import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan, Between } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

import { Mantenimiento } from './entities/mantenimiento-vehiculo.entity';
import { User } from '../users/entities/user.entity';
import { EstadoMantenimiento } from './enums/mantenimiento.enums';
import { RoleEnum } from '../roles/role.enum';

@Injectable()
export class VehiculosSchedulerService {
  private readonly logger = new Logger(VehiculosSchedulerService.name);

  constructor(
    @InjectRepository(Mantenimiento)
    private readonly mantenimientoRepo: Repository<Mantenimiento>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailer: MailerService,
    private readonly cfg: ConfigService,
  ) {}

  /**
   * TAREA 1: Enviar notificaciones por email
   * Se ejecuta todos los días a las 9:00 AM
   * Notifica sobre mantenimientos programados para MAÑANA
   */
  @Cron('0 9 * * *', {
    name: 'notificar-mantenimientos',
    timeZone: 'America/Costa_Rica',
  })
  async enviarNotificacionesMantenimiento(): Promise<void> {
    this.logger.log('=== INICIANDO: Envío de notificaciones de mantenimiento ===');

    try {
      // Obtener mantenimientos para notificar (fecha = mañana)
      const mantenimientos = await this.obtenerMantenimientosParaNotificar();

      if (mantenimientos.length === 0) {
        this.logger.log('No hay mantenimientos programados para mañana.');
        return;
      }

      this.logger.log(`Se encontraron ${mantenimientos.length} mantenimiento(s) para notificar.`);

      // Obtener emails de administradores y superusuarios
      const adminEmails = await this.obtenerEmailsAdministradores();

      if (adminEmails.length === 0) {
        this.logger.warn('No se encontraron administradores para notificar.');
        return;
      }

      // Enviar notificaciones
      await this.enviarEmailNotificacion(mantenimientos, adminEmails);

      this.logger.log(`✅ Notificaciones enviadas exitosamente a ${adminEmails.length} administrador(es).`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Error en tarea de notificaciones: ${errorMessage}`);
    }
  }

  /**
   * TAREA 2: Cambiar estado automáticamente
   * Se ejecuta todos los días a las 12:01 AM (medianoche)
   * Cambia mantenimientos PENDIENTE → EN_REVISION cuando llega su fecha
   */
  @Cron('1 0 * * *', {
    name: 'cambiar-estado-mantenimientos',
    timeZone: 'America/Costa_Rica',
  })
  async cambiarEstadoMantenimientosDelDia(): Promise<void> {
    this.logger.log('=== INICIANDO: Cambio automático de estado de mantenimientos ===');

    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);

      // Buscar mantenimientos PENDIENTES cuya fecha es HOY
      const mantenimientos = await this.mantenimientoRepo.find({
        where: {
          estado: EstadoMantenimiento.PENDIENTE,
          fecha: Between(hoy, manana),
        },
        relations: ['vehiculo'],
      });

      if (mantenimientos.length === 0) {
        this.logger.log('No hay mantenimientos pendientes para hoy.');
        return;
      }

      this.logger.log(`Se encontraron ${mantenimientos.length} mantenimiento(s) para cambiar a EN_REVISION.`);

      // Cambiar estado de cada uno
      for (const mantenimiento of mantenimientos) {
        mantenimiento.estado = EstadoMantenimiento.EN_REVISION;
        await this.mantenimientoRepo.save(mantenimiento);

        this.logger.debug(
          `Mantenimiento ${mantenimiento.id} del vehículo ${mantenimiento.vehiculo.placa} → EN_REVISION`
        );
      }

      this.logger.log(`✅ ${mantenimientos.length} mantenimiento(s) cambiado(s) a EN_REVISION.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Error en tarea de cambio de estado: ${errorMessage}`);
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Obtener mantenimientos programados para MAÑANA
   */
  private async obtenerMantenimientosParaNotificar(): Promise<Mantenimiento[]> {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    manana.setHours(0, 0, 0, 0);

    const pasadoManana = new Date(manana);
    pasadoManana.setDate(pasadoManana.getDate() + 1);

    return this.mantenimientoRepo.find({
      where: {
        estado: EstadoMantenimiento.PENDIENTE,
        fecha: Between(manana, pasadoManana),
      },
      relations: ['vehiculo'],
      order: { fecha: 'ASC' },
    });
  }

  /**
   * Obtener emails de todos los administradores y superusuarios
   */
  private async obtenerEmailsAdministradores(): Promise<string[]> {
    const users = await this.userRepo.find({
      relations: ['roles'],
    });

    const admins = users.filter(user => 
      user.roles.some(role => 
        role.name === RoleEnum.ADMIN || role.name === RoleEnum.SUPERUSER
      )
    );

    return admins.map(user => user.email);
  }

  /**
   * Enviar email de notificación a administradores
   */
  private async enviarEmailNotificacion(
    mantenimientos: Mantenimiento[],
    emails: string[]
  ): Promise<void> {
    const frontendUrl = this.cfg.get<string>('FRONTEND_URL', 'http://localhost:5173');

    // Crear lista HTML de mantenimientos
    const listaMantenimientos = mantenimientos
      .map(m => {
        const fecha = new Date(m.fecha).toLocaleDateString('es-CR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        return `
          <li style="margin-bottom: 15px; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #dc3545;">
            <strong>Vehículo:</strong> ${m.vehiculo.placa} (${m.vehiculo.tipo})<br>
            <strong>Fecha:</strong> ${fecha}<br>
            <strong>Descripción:</strong> ${m.descripcion}
            ${m.observaciones ? `<br><strong>Observaciones:</strong> ${m.observaciones}` : ''}
          </li>
        `;
      })
      .join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc3545;">🚒 Bomberos Voluntarios de Nosara</h1>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="color: #856404; margin: 0;">⚠️ Recordatorio de Mantenimiento</h2>
        </div>
        
        <p style="font-size: 16px;">
          <strong>Los siguientes vehículos tienen mantenimiento programado para MAÑANA:</strong>
        </p>
        
        <ul style="list-style: none; padding: 0;">
          ${listaMantenimientos}
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}/vehiculos" 
             style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Ver Detalles en el Sistema
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Por favor, asegúrate de que todo esté preparado para el mantenimiento programado.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="font-size: 12px; color: #666; text-align: center;">
          Bomberos Voluntarios de Nosara<br>
          Este es un email automático, por favor no respondas.
        </p>
      </div>
    `;

    try {
      await this.mailer.sendMail({
        to: emails,
        subject: `🚒 Recordatorio: ${mantenimientos.length} mantenimiento(s) programado(s) para mañana`,
        html: htmlContent,
      });

      this.logger.log(`Email enviado exitosamente a: ${emails.join(', ')}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error enviando email: ${errorMessage}`);

      // En desarrollo, mostrar en consola
      if (process.env.NODE_ENV !== 'production') {
        this.logger.warn('=== CONTENIDO DEL EMAIL (DESARROLLO) ===');
        this.logger.warn(`Para: ${emails.join(', ')}`);
        this.logger.warn(`Mantenimientos: ${mantenimientos.length}`);
        mantenimientos.forEach(m => {
          this.logger.warn(`- ${m.vehiculo.placa}: ${m.descripcion}`);
        });
        this.logger.warn('========================================');
      }
    }
  }
}