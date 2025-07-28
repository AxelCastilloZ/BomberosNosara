/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { VoluntariosService } from './voluntarios.service';
import { CreateParticipacionDto } from './dto/CreateParticipacionDto';

import { RoleEnum } from '../roles/role.enum';
import { Request } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('voluntarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VoluntariosController {
  constructor(private readonly voluntariosService: VoluntariosService) {}

  // Voluntario crea participación
  @Post('participaciones')
  @Roles(RoleEnum.VOLUNTARIO)
  crear(@Body() dto: CreateParticipacionDto, @Req() req: Request) {
    return this.voluntariosService.crearParticipacion(req.user as any, dto);
  }

  // Voluntario ve su historial
  @Get('mis-participaciones')
  @Roles(RoleEnum.VOLUNTARIO)
  historial(@Req() req: Request, @Query('estado') estado?: string) {
    return this.voluntariosService.listarHistorial(req.user as any, estado);
  }

  // Admin ve todas las participaciones
  @Get('participaciones')
  @Roles(RoleEnum.ADMIN)
  listarTodas(@Query('estado') estado?: string) {
    return this.voluntariosService.listarTodasParticipaciones(estado);
  }
}
