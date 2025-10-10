import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Patch, 
  Delete,
  Param, 
  Body,
  Query,
  UseGuards 
} from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { EditVehiculoDto } from './dto/edit-vehiculo.dto';
import { MantenimientoVehiculoDto } from './dto/mantenimiento-vehiculo.dto';
import { MantenimientoProgramadoVehiculoDto } from './dto/mantenimiento-programado-vehiculo.dto';
import { ReposicionVehiculoDto } from './dto/reposicion-vehiculo.dto';
import { PaginatedVehiculoQueryDto } from './dto/paginated-query.dto';
import { EstadoVehiculo } from './enums/vehiculo-bomberil.enums';

// Imports para autenticación y autorización
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { RoleEnum } from '../roles/role.enum';

@Controller('vehiculos')
@UseGuards(JwtAuthGuard)
export class VehiculosController {
  constructor(private readonly service: VehiculosService) {}

  // ================= OPERACIONES BÁSICAS CRUD =================

  @Get()
  findAll(@Query() query: PaginatedVehiculoQueryDto) {
    // Si viene algún parámetro de paginación o filtro, usa el método paginado
    if (query.page || query.limit || query.search || query.status || query.type) {
      return this.service.findAllPaginated(query);
    }
    // Si no viene nada, devuelve todos (para mantener compatibilidad)
    return this.service.findAll();
  }

  @Get('with-deleted')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  findAllWithDeleted() {
    return this.service.findAllWithDeleted();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateVehiculoDto,
    @GetUser('id') userId: number
  ) {
    return this.service.create(dto, userId);
  }

  // ================= EDICIÓN Y ACTUALIZACIÓN =================

  @Patch(':id/estado')
  async updateEstado(
    @Param('id') id: string,
    @Body() body: { 
      estadoActual: EstadoVehiculo; 
      observaciones?: string;
      observacionesProblema?: string;
      motivoBaja?: string;
    },
    @GetUser('id') userId: number
  ) {
    const editDto: EditVehiculoDto = {
      estadoActual: body.estadoActual,
      observaciones: body.observaciones,
      observacionesProblema: body.observacionesProblema,
      motivoBaja: body.motivoBaja
    };

    return this.service.edit(id, editDto, userId);
  }

  @Patch(':id')
  edit(
    @Param('id') id: string,
    @Body() dto: EditVehiculoDto,
    @GetUser('id') userId: number
  ) {
    return this.service.edit(id, dto, userId);
  }

  // ================= SOFT DELETE Y RESTAURACIÓN =================

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  softDelete(
    @Param('id') id: string,
    @GetUser('id') userId: number
  ) {
    return this.service.softDelete(id, userId);
  }

  @Post(':id/restore')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.SUPERUSER)
  restore(
    @Param('id') id: string,
    @GetUser('id') userId: number
  ) {
    return this.service.restore(id, userId);
  }

  // ================= OPERACIONES ESPECIALES =================

  @Put(':id/estado')
  updateEstadoLegacy(
    @Param('id') id: string, 
    @Body('estadoActual') estado: string,
    @GetUser('id') userId: number
  ) {
    return this.service.updateEstado(id, estado as any, userId);
  }

  @Patch(':id/dar-de-baja')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  darDeBaja(
    @Param('id') id: string, 
    @Body('motivo') motivo: string,
    @GetUser('id') userId: number
  ) {
    const editDto: EditVehiculoDto = {
      estadoActual: EstadoVehiculo.BAJA,
      motivoBaja: motivo
    };
    return this.service.edit(id, editDto, userId);
  }

  @Post(':id/reposicion')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  registrarReposicion(
    @Param('id') id: string, 
    @Body() dto: ReposicionVehiculoDto,
    @GetUser('id') userId: number
  ) {
    return this.service.registrarReposicion(id, dto, userId);
  }

  // ================= MANTENIMIENTOS =================

  @Put(':id/mantenimiento')
  registrarMantenimiento(
    @Param('id') id: string, 
    @Body() dto: MantenimientoVehiculoDto | MantenimientoProgramadoVehiculoDto,
    @GetUser('id') userId: number
  ) {
    if ('fechaProximoMantenimiento' in dto) {
      return this.service.programarMantenimiento(id, dto as MantenimientoProgramadoVehiculoDto, userId);
    } else {
      return this.service.registrarMantenimiento(id, dto as MantenimientoVehiculoDto, userId);
    }
  }

  @Post(':id/historial')
  registrarMantenimientoHistorico(
    @Param('id') id: string, 
    @Body() dto: MantenimientoVehiculoDto,
    @GetUser('id') userId: number
  ) {
    return this.service.registrarMantenimiento(id, dto, userId);
  }

  @Get(':id/historial')
  obtenerHistorial(@Param('id') id: string) {
    return this.service.obtenerHistorial(id);
  }

  @Delete(':id/mantenimiento-programado')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  cancelarMantenimientoProgramado(
    @Param('id') id: string,
    @GetUser('id') userId: number
  ) {
    return this.service.cancelarMantenimientoProgramado(id, userId);
  }

  // ================= MANTENIMIENTOS - SOFT DELETE Y RESTAURACIÓN =================

  @Delete('mantenimiento/:id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  softDeleteMantenimiento(
    @Param('id') id: string,
    @GetUser('id') userId: number
  ) {
    return this.service.softDeleteMantenimiento(id, userId);
  }

  @Post('mantenimiento/:id/restore')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.SUPERUSER)
  restoreMantenimiento(
    @Param('id') id: string,
    @GetUser('id') userId: number
  ) {
    return this.service.restoreMantenimiento(id, userId);
  }

  // ================= UTILIDADES =================

  @Get('placa/:placa/exists')
  existsByPlaca(@Param('placa') placa: string) {
    return this.service.existsByPlaca(placa);
  }
}