import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { EquipoBomberilService } from './equipo-bomberil.service';

import { CreateEquipoBomberilDto } from './dto/create-equipo-bomberil.dto';
import { UpdateEquipoBomberilDto } from './dto/update-equipo-bomberil.dto';
import { ReposicionDto } from './dto/reposicion.dto';
import { CreateCatalogoDto } from './dto/create-catalogo.dto';
import { DarDeBajaDto } from './dto/dar-de-baja.dto';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto';
import { ProgramarMantenimientoDto } from './dto/programar-mantenimiento.dto';
import { EstadoParcialDto } from './dto/estado-parcial.dto';
import { UpdateEstadoActualDto } from './dto/update-estado-actual.dto';

@Controller('equipos-bomberiles')
export class EquipoBomberilController {
  constructor(private readonly service: EquipoBomberilService) {}

  /* --------- Catálogo --------- */
  @Get('catalogo')
  getCatalogos() {
    return this.service.findCatalogos();
  }

  @Post('catalogo')
  createCatalogo(@Body() dto: CreateCatalogoDto) {
    return this.service.createCatalogo(dto);
  }

  @Get('por-catalogo/:catalogoId')
  getPorCatalogo(@Param('catalogoId') catalogoId: string) {
    return this.service.findByCatalogo(catalogoId);
  }

  /* ----- Mantenimiento / Historial ----- */
  @Post(':id/historial')
  registrarMantenimiento(@Param('id') id: string, @Body() dto: CreateMantenimientoDto) {
    return this.service.registrarMantenimiento(id, dto);
  }

  @Get(':id/historial')
  getHistorial(@Param('id') id: string) {
    return this.service.getHistorial(id);
  }

  @Put(':id/mantenimiento')
  programarMantenimiento(@Param('id') id: string, @Body() dto: ProgramarMantenimientoDto) {
    return this.service.programarMantenimiento(id, dto);
  }

  /* --------- Bajas / Reposición / Estado parcial --------- */
  @Patch(':id/dar-de-baja')
  darDeBaja(@Param('id') id: string, @Body() dto: DarDeBajaDto) {
    return this.service.darDeBaja(id, dto.cantidad);
  }

  @Patch(':id/estado-parcial')
  moverEstadoParcial(@Param('id') id: string, @Body() dto: EstadoParcialDto) {
    return this.service.moverEstadoParcial(id, dto.cantidad, dto.estadoActual);
  }

  /** Alias opcional para frontends que llamen /estado-parcial */
  @Patch(':id/estado')
  moverEstadoParcialAlias(@Param('id') id: string, @Body() dto: EstadoParcialDto) {
    return this.service.moverEstadoParcial(id, dto.cantidad, dto.estadoActual);
  }

  /* --------- Cambio total de estado (no crea filas) --------- */
  @Patch(':id/estado-actual')
  actualizarEstadoActual(@Param('id') id: string, @Body() dto: UpdateEstadoActualDto) {
    return this.service.actualizarEstadoActual(id, dto.estadoActual);
  }

  /** Alias compatible */
  @Patch(':id/estado-actual/alias')
  actualizarEstadoActualAlias(@Param('id') id: string, @Body() dto: UpdateEstadoActualDto) {
    return this.service.actualizarEstadoActual(id, dto.estadoActual);
  }

  @Post(':id/reposicion')
  solicitarReposicion(@Param('id') id: string, @Body() dto: ReposicionDto) {
    return this.service.solicitarReposicion(id, dto);
  }

  /* -------------- CRUD -------------- */
  @Post()
  create(@Body() dto: CreateEquipoBomberilDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  // IMPORTANTE: dinámicas al final
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEquipoBomberilDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
