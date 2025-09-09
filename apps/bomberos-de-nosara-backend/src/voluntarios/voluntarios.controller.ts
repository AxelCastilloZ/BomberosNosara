/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
  Patch,
  ParseIntPipe,
  Param,
  Logger,
} from '@nestjs/common';
import { VoluntariosService } from './voluntarios.service';
import { CreateParticipacionDto } from './dto/CreateParticipacionDto';

import { RoleEnum } from '../roles/role.enum';
import { Request } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ActualizarEstadoDto } from './dto/ActualizarEstadoDto';

interface AuthUser {
  id: number;
  rol: string;
}

@Controller('voluntarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VoluntariosController {
  constructor(private readonly voluntariosService: VoluntariosService) {}

  // Voluntario crea participaciones
  @Post('participaciones')
  @Roles(RoleEnum.VOLUNTARIO)
  async crear(@Body() dto: CreateParticipacionDto, @Req() req: Request) {
    try {
      return await this.voluntariosService.crearParticipacion(
        req.user as any,
        dto,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        Logger.error('Error al crear participación', error.stack);
      } else {
        Logger.error('Error al crear participación', String(error));
      }
      throw error;
    }
  }

  // Voluntario ve su historial
  @Get('mis-participaciones')
  @Roles(RoleEnum.VOLUNTARIO)
  historial(@Req() req: Request, @Query('estado') estado?: string) {
    return this.voluntariosService.listarHistorial(req.user as any, estado);
  }

  // Voluntario ve sus horas aprobadas
  @Get('mis-horas-Aprobadas')
  @Roles(RoleEnum.VOLUNTARIO)
  async misHoras(@Req() req: Request & { user: AuthUser }) {
    const horas =
      await this.voluntariosService.obtenerHorasAprobadasPorVoluntario(
        req.user.id,
      );
    return { horasAprobadas: horas };
  }

  // Voluntario ve sus horas pendientes
  @Get('mis-horas-Pendientes')
  @Roles(RoleEnum.VOLUNTARIO)
  async misHorasPendientes(@Req() req: Request & { user: AuthUser }) {
    const horas =
      await this.voluntariosService.obtenerHorasPendientesPorVoluntario(
        req.user.id,
      );
    return { horasPendientes: horas };
  }

  // Admin ve todas las participaciones
  @Get('participaciones')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  listarTodas(@Query('estado') estado?: string) {
    return this.voluntariosService.listarTodasParticipaciones(estado);
  }

  // Admin actualiza estado de participación
  @Patch('participaciones/:id/estado')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEstadoDto,
  ) {
    return this.voluntariosService.actualizarEstadoParticipacion(id, dto);
  }

  // Admin obtiene estadísticas generales
  @Get('estadisticas')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  async obtenerEstadisticas() {
    return this.voluntariosService.obtenerEstadisticasGenerales();
  }
}
