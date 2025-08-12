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

@Controller('voluntarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VoluntariosController {
  constructor(private readonly voluntariosService: VoluntariosService) {}

  // Voluntario crea participación
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
  @Get('mis-horas')
  @Roles(RoleEnum.VOLUNTARIO)
  async misHoras(@Req() req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = req.user as any;
    const horas =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      await this.voluntariosService.obtenerHorasAprobadasPorVoluntario(user.id);
    return { horasAprobadas: horas };
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
}
