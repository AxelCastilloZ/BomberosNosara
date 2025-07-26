// vehiculos.controller.ts
import { Controller, Get, Post, Put, Patch, Param, Body } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { MantenimientoVehiculoDto } from './dto/mantenimiento-vehiculo.dto';
import { MantenimientoProgramadoVehiculoDto } from './dto/mantenimiento-programado-vehiculo.dto';
import { ReposicionVehiculoDto } from './dto/reposicion-vehiculo.dto';

@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly service: VehiculosService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateVehiculoDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVehiculoDto) {
    return this.service.update(id, dto);
  }

  @Put(':id/estado')
  updateEstado(@Param('id') id: string, @Body('estadoActual') estado: string) {
    return this.service.updateEstado(id, estado as any);
  }

  @Patch(':id/dar-de-baja')
  darDeBaja(@Param('id') id: string, @Body('motivo') motivo: string) {
    return this.service.darDeBaja(id, motivo);
  }

  @Post(':id/reposicion')
  registrarReposicion(@Param('id') id: string, @Body() dto: ReposicionVehiculoDto) {
    return this.service.registrarReposicion(id, dto);
  }

  @Put(':id/mantenimiento')
  registrarMantenimiento(@Param('id') id: string, @Body() dto: MantenimientoVehiculoDto | MantenimientoProgramadoVehiculoDto) {
    if ('fechaProximoMantenimiento' in dto) {
      return this.service.programarMantenimiento(id, dto as MantenimientoProgramadoVehiculoDto);
    } else {
      return this.service.registrarMantenimiento(id, dto as MantenimientoVehiculoDto);
    }
  }

  @Post(':id/historial')
  registrarMantenimientoHistorico(@Param('id') id: string, @Body() dto: MantenimientoVehiculoDto) {
    return this.service.registrarMantenimiento(id, dto);
  }

  @Get(':id/historial')
  obtenerHistorial(@Param('id') id: string) {
    return this.service.obtenerHistorial(id);
  }
}
