import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { DonantesService } from './donantes.service';
import { CreateDonanteDto } from './dto/create-donante.dto';
import { UpdateDonanteDto } from './dto/update-donante.dto';
import { Donante } from './entities/donante.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../roles/role.enum';

@Controller('donantes')
export class DonantesController {
  constructor(private readonly donantesService: DonantesService) {}

  
  @Get()
  findAll(): Promise<Donante[]> {
    return this.donantesService.findAll();
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPERUSER, RoleEnum.ADMIN)
  @Post()
  create(@Body() dto: CreateDonanteDto): Promise<Donante> {
    return this.donantesService.create(dto);
  }

  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPERUSER, RoleEnum.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Donante> {
    return this.donantesService.findOne(id);
  }

  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPERUSER, RoleEnum.ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDonanteDto): Promise<Donante> {
    return this.donantesService.update(id, dto);
  }

  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPERUSER, RoleEnum.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<Donante> {
    return this.donantesService.remove(id);
  }
}
