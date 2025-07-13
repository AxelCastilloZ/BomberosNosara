// src/equipo-bomberil/equipo-bomberil.controller.ts
import { Body, Controller, Delete, Get, Param, Put, Post,Patch } from '@nestjs/common';
import { EquipoBomberilService } from './equipo-bomberil.service';
import { CreateEquipoBomberilDto } from './dto/create-equipo-bomberil.dto';
import { UpdateEquipoBomberilDto } from './dto/update-equipo-bomberil.dto';
import { ReposicionDto } from './dto/reposicion.dto';
import { CreateCatalogoDto } from './dto/create-catalogo.dto';
import { DarDeBajaDto } from './dto/dar-de-baja.dto';

@Controller('equipos-bomberiles')
export class EquipoBomberilController {
  constructor(private readonly service: EquipoBomberilService) {}

  @Post()
  create(@Body() dto: CreateEquipoBomberilDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }


  @Get('por-catalogo/:catalogoId')
  getPorCatalogo(@Param('catalogoId') catalogoId: string) {
    return this.service.findByCatalogo(catalogoId);
  }


  @Get('catalogo')
getCatalogos() {
  return this.service.findCatalogos();
}

@Post('catalogo')
createCatalogo(@Body() dto: CreateCatalogoDto) {
  return this.service.createCatalogo(dto);
}


@Patch(':id/dar-de-baja')
darDeBaja(@Param('id') id: string, @Body() dto: DarDeBajaDto) {
  return this.service.darDeBaja(id, dto.cantidad);
}


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

  @Post(':id/reposicion')
  solicitarReposicion(@Param('id') id: string, @Body() dto: ReposicionDto) {
    return this.service.solicitarReposicion(id, dto);
  }




}
