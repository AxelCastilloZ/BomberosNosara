import { 
  Controller, 
  Get, 
  Post, 
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
import { ProgramarMantenimientoDto } from './dto/programar-mantenimiento.dto';
import { RegistrarMantenimientoDto } from './dto/registrar-matenimiento.dto';
import { CompletarMantenimientoDto } from './dto/completar-mantenimiento.dto';
import { PaginatedVehiculoQueryDto } from './dto/paginated-query.dto';
import { EstadoVehiculo } from './enums/vehiculo-bomberil.enums';
import { EstadoMantenimiento } from './enums/mantenimiento.enums';

// Imports para autenticación y autorización
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { RoleEnum } from '../roles/role.enum';
import { EditMantenimientoDto } from './dto/edit-mantenimiento.dto';

@Controller('vehiculos')
@UseGuards(JwtAuthGuard)
export class VehiculosController {
  constructor(private readonly service: VehiculosService) {}

  // ==================== OPERACIONES BÁSICAS CRUD ====================

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

  @Post()
  create(
    @Body() dto: CreateVehiculoDto,
    @GetUser('id') userId: number
  ) {
    return this.service.create(dto, userId);
  }

  // ==================== MANTENIMIENTOS - CONSULTAS ESPECÍFICAS (SIN PARÁMETROS) ====================
  // IMPORTANTE: Estas rutas deben ir ANTES de las rutas con :id para evitar conflictos

  @Get('mantenimientos/todos')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  obtenerTodosMantenimientos() {
    return this.service.obtenerTodosMantenimientos();
  }

  @Get('mantenimientos/pendientes')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  obtenerMantenimientosPendientes() {
    return this.service.obtenerMantenimientosPendientes();
  }

  @Get('mantenimientos/del-dia')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  obtenerMantenimientosDelDia() {
    return this.service.obtenerMantenimientosDelDia();
  }

  @Get('mantenimientos/notificar')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  obtenerMantenimientosParaNotificar() {
    return this.service.obtenerMantenimientosParaNotificar();
  }

  // ==================== REPORTES DE COSTOS (RUTAS ESPECÍFICAS) ====================

  @Get('reportes/costos-mensuales')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  obtenerCostosMensuales(
    @Query('mes') mes: string,
    @Query('anio') anio: string
  ) {
    return this.service.obtenerCostosMensuales(Number(mes), Number(anio));
  }

  // ==================== UTILIDADES (RUTAS ESPECÍFICAS) ====================

  @Get('placa/:placa/exists')
  existsByPlaca(@Param('placa') placa: string) {
    return this.service.existsByPlaca(placa);
  }

  // ==================== RUTAS CON :id (DEBEN IR DESPUÉS DE LAS ESPECÍFICAS) ====================

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  edit(
    @Param('id') id: string,
    @Body() dto: EditVehiculoDto,
    @GetUser('id') userId: number
  ) {
    return this.service.edit(id, dto, userId);
  }

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

  // ==================== OPERACIONES ESPECIALES DE VEHÍCULO ====================

  @Patch(':id/estado')
  async updateEstado(
    @Param('id') id: string,
    @Body() body: { estadoActual: EstadoVehiculo },
    @GetUser('id') userId: number
  ) {
    return this.service.updateEstado(id, body.estadoActual, userId);
  }

  @Patch(':id/dar-de-baja')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  darDeBaja(
    @Param('id') id: string, 
    @Body('motivo') motivo: string,
    @GetUser('id') userId: number
  ) {
    return this.service.darDeBaja(id, motivo, userId);
  }

  // ==================== MANTENIMIENTOS - PROGRAMAR/REGISTRAR ====================

  @Post(':id/mantenimientos/programar')
  programarMantenimiento(
    @Param('id') vehiculoId: string, 
    @Body() dto: ProgramarMantenimientoDto,
    @GetUser('id') userId: number
  ) {
    return this.service.programarMantenimiento(vehiculoId, dto, userId);
  }

  @Post(':id/mantenimientos/registrar')
  registrarMantenimiento(
    @Param('id') vehiculoId: string, 
    @Body() dto: RegistrarMantenimientoDto,
    @GetUser('id') userId: number
  ) {
    return this.service.registrarMantenimiento(vehiculoId, dto, userId);
  }

  // ==================== MANTENIMIENTOS - CONSULTAS POR VEHÍCULO ====================

  @Get(':id/mantenimientos/historial')
  obtenerHistorial(@Param('id') vehiculoId: string) {
    return this.service.obtenerHistorial(vehiculoId);
  }

  @Get(':id/mantenimientos/proximo')
  obtenerProximoMantenimiento(@Param('id') vehiculoId: string) {
    return this.service.obtenerProximoMantenimiento(vehiculoId);
  }

  // ==================== REPORTES DE COSTOS POR VEHÍCULO ====================

  @Get(':id/reportes/costos')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  obtenerCostosPorVehiculo(
    @Param('id') vehiculoId: string,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string
  ) {
    return this.service.obtenerCostosPorVehiculo(
      vehiculoId, 
      mes ? Number(mes) : undefined,
      anio ? Number(anio) : undefined
    );
  }

  // ==================== MANTENIMIENTOS - COMPLETAR/CAMBIAR ESTADO ====================

  @Patch('mantenimientos/:mantenimientoId/completar')
  completarMantenimiento(
    @Param('mantenimientoId') mantenimientoId: string,
    @Body() dto: CompletarMantenimientoDto,
    @GetUser('id') userId: number
  ) {
    return this.service.completarMantenimiento(mantenimientoId, dto, userId);
  }




 @Patch('mantenimientos/:mantenimientoId/editar')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  editarMantenimiento(
    @Param('mantenimientoId') mantenimientoId: string,
    @Body() dto: EditMantenimientoDto,
    @GetUser('id') userId: number
  ) {
    return this.service.editarMantenimiento(mantenimientoId, dto, userId);
  }





  @Patch('mantenimientos/:mantenimientoId/estado')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  cambiarEstadoMantenimiento(
    @Param('mantenimientoId') mantenimientoId: string,
    @Body('estado') estado: EstadoMantenimiento,
    @GetUser('id') userId: number
  ) {
    return this.service.cambiarEstadoMantenimiento(mantenimientoId, estado, userId);
  }

  // ==================== MANTENIMIENTOS - SOFT DELETE Y RESTAURACIÓN ====================

  @Delete('mantenimientos/:id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPERUSER)
  softDeleteMantenimiento(
    @Param('id') id: string,
    @GetUser('id') userId: number
  ) {
    return this.service.softDeleteMantenimiento(id, userId);
  }

  @Post('mantenimientos/:id/restore')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.SUPERUSER)
  restoreMantenimiento(
    @Param('id') id: string,
    @GetUser('id') userId: number
  ) {
    return this.service.restoreMantenimiento(id, userId);
  }
}