import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

import { Vehiculo } from './entities/vehiculo.entity';
import { Mantenimiento } from './entities/mantenimiento-vehiculo.entity';

import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { EditVehiculoDto } from './dto/edit-vehiculo.dto';
import { ProgramarMantenimientoDto } from './dto/programar-mantenimiento.dto';
import { CompletarMantenimientoDto } from './dto/completar-mantenimiento.dto';
import { PaginatedVehiculoQueryDto } from './dto/paginated-query.dto';
import { PaginatedVehiculoResponseDto } from './dto/paginated-response.dto';
import { EstadoVehiculo } from './enums/vehiculo-bomberil.enums';
import { EstadoMantenimiento } from './enums/mantenimiento.enums';
import { RegistrarMantenimientoDto } from './dto/registrar-matenimiento.dto';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepo: Repository<Vehiculo>,
    @InjectRepository(Mantenimiento)
    private readonly mantenimientoRepo: Repository<Mantenimiento>,
  ) {}

  // ==================== HELPERS ====================

  private ensurePastOrToday(dateStr: string, field = 'fechaAdquisicion') {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException({
        code: 'INVALID_DATE',
        field,
        message: `La ${field} no es válida`,
      });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(d);
    inputDate.setHours(0, 0, 0, 0);
    
    if (inputDate > today) {
      throw new BadRequestException({
        code: 'DATE_IN_FUTURE',
        field,
        message: `La ${field} no puede ser mayor a hoy`,
      });
    }
    return d;
  }

  /**
   * Valida transiciones de estado según las reglas de negocio
   */
  private async validateStateTransition(
    currentState: EstadoVehiculo,
    newState: EstadoVehiculo,
    dto: EditVehiculoDto
  ): Promise<void> {
    // Estados que requieren información adicional
    if (newState === EstadoVehiculo.MALO && !dto.observacionesProblema) {
      throw new BadRequestException({
        code: 'MISSING_PROBLEM_DESCRIPTION',
        message: 'Describe el problema del vehículo al marcarlo como MALO',
      });
    }

    if (newState === EstadoVehiculo.BAJA && !dto.motivoBaja) {
      throw new BadRequestException({
        code: 'MISSING_REASON',
        message: 'Especifica el motivo para dar de baja el vehículo',
      });
    }

    // Validar transiciones válidas
    const validTransitions: Record<EstadoVehiculo, EstadoVehiculo[]> = {
      [EstadoVehiculo.EN_SERVICIO]: [
        EstadoVehiculo.MALO,
        EstadoVehiculo.FUERA_DE_SERVICIO,
        EstadoVehiculo.BAJA
      ],
      [EstadoVehiculo.MALO]: [
        EstadoVehiculo.EN_SERVICIO,
        EstadoVehiculo.FUERA_DE_SERVICIO,
        EstadoVehiculo.BAJA
      ],
      [EstadoVehiculo.FUERA_DE_SERVICIO]: [
        EstadoVehiculo.EN_SERVICIO,
        EstadoVehiculo.MALO,
        EstadoVehiculo.BAJA
      ],
      [EstadoVehiculo.BAJA]: [
        EstadoVehiculo.EN_SERVICIO,
        EstadoVehiculo.MALO,
        EstadoVehiculo.FUERA_DE_SERVICIO
      ]
    };

    if (!validTransitions[currentState]?.includes(newState)) {
      throw new BadRequestException({
        code: 'INVALID_STATE_TRANSITION',
        message: `No se puede cambiar de ${currentState} a ${newState}`,
      });
    }
  }

  // ==================== CRUD BÁSICO VEHÍCULOS ====================
  
  async findAll(): Promise<Vehiculo[]> {
    return this.vehiculoRepo.find();
  }

  async findAllPaginated(query: PaginatedVehiculoQueryDto): Promise<PaginatedVehiculoResponseDto> {
    const { page = 1, limit = 10, search, status, type } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.placa = Like(`%${search}%`);
    }

    if (status) {
      where.estadoActual = status;
    }

    if (type) {
      where.tipo = type;
    }

    const [data, total] = await this.vehiculoRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Vehiculo> {
    const v = await this.vehiculoRepo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Vehículo no encontrado');
    return v;
  }

  async findAllWithDeleted(): Promise<Vehiculo[]> {
    return this.vehiculoRepo.find({ withDeleted: true });
  }

  async create(dto: CreateVehiculoDto, userId: number): Promise<Vehiculo> {
    const fechaAdq = this.ensurePastOrToday(dto.fechaAdquisicion, 'fechaAdquisicion');

    const entity = this.vehiculoRepo.create({
      ...dto,
      placa: dto.placa?.trim(),
      fechaAdquisicion: fechaAdq,
      createdBy: userId,
      updatedBy: userId,
    });
    
    return await this.vehiculoRepo.save(entity);
  }

  async edit(id: string, dto: EditVehiculoDto, userId: number): Promise<Vehiculo> {
    const vehiculo = await this.findOne(id);

    // Validar transiciones de estado si se está cambiando
    if (dto.estadoActual && dto.estadoActual !== vehiculo.estadoActual) {
      await this.validateStateTransition(vehiculo.estadoActual, dto.estadoActual, dto);
    }

    // Si viene fecha, valida que no sea futura
    let fechaAdq = vehiculo.fechaAdquisicion;
    if (dto.fechaAdquisicion) {
      fechaAdq = this.ensurePastOrToday(dto.fechaAdquisicion, 'fechaAdquisicion');
    }

    // Manejo especial de observaciones según el estado
    let observacionesFinales = vehiculo.observaciones;
    if (dto.estadoActual === EstadoVehiculo.MALO && dto.observacionesProblema) {
      observacionesFinales = `${observacionesFinales ?? ''} | PROBLEMA: ${dto.observacionesProblema}`.trim();
    }
    if (dto.estadoActual === EstadoVehiculo.BAJA && dto.motivoBaja) {
      observacionesFinales = `${observacionesFinales ?? ''} | BAJA: ${dto.motivoBaja}`.trim();
    }

    Object.assign(vehiculo, {
      ...dto,
      placa: dto.placa?.trim() ?? vehiculo.placa,
      fechaAdquisicion: fechaAdq,
      observaciones: observacionesFinales,
      updatedBy: userId,
    });

    return await this.vehiculoRepo.save(vehiculo);
  }

  async updateEstado(id: string, estadoActual: Vehiculo['estadoActual'], userId: number): Promise<Vehiculo> {
    const vehiculo = await this.findOne(id);
    vehiculo.estadoActual = estadoActual;
    vehiculo.updatedBy = userId;
    return this.vehiculoRepo.save(vehiculo);
  }

  async darDeBaja(id: string, motivo: string, userId: number): Promise<Vehiculo> {
    const vehiculo = await this.findOne(id);
    vehiculo.estadoActual = EstadoVehiculo.BAJA;
    vehiculo.observaciones = `${vehiculo.observaciones ?? ''} | Baja: ${motivo}`.trim();
    vehiculo.updatedBy = userId;
    return this.vehiculoRepo.save(vehiculo);
  }

  // ==================== SOFT DELETE Y RESTAURACIÓN ====================

  async softDelete(id: string, userId: number): Promise<{ message: string }> {
    const vehiculo = await this.findOne(id);

    // CAMBIO CRÍTICO: Ya NO eliminamos mantenimientos en cascada
    // Los mantenimientos persisten para reportes de costos
    vehiculo.deletedBy = userId;
    await this.vehiculoRepo.save(vehiculo);
    await this.vehiculoRepo.softDelete(id);

    return { 
      message: 'Vehículo eliminado correctamente. Los mantenimientos registrados se mantienen para reportes de costos.' 
    };
  }

  async restore(id: string, userId: number): Promise<Vehiculo> {
    const vehiculo = await this.vehiculoRepo.findOne({
      where: { id },
      withDeleted: true
    });

    if (!vehiculo) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    if (!vehiculo.deletedAt) {
      throw new BadRequestException({
        code: 'NOT_DELETED',
        message: 'El vehículo no está eliminado',
      });
    }

    // CAMBIO: Ya no restauramos mantenimientos (nunca se eliminaron)
    await this.vehiculoRepo.restore(id);

    vehiculo.updatedBy = userId;
    vehiculo.deletedBy = null;
    vehiculo.observaciones = `${vehiculo.observaciones ?? ''} | RESTAURADO por usuario ${userId}`.trim();

    return await this.vehiculoRepo.save(vehiculo);
  }

  // ==================== MANTENIMIENTOS - PROGRAMAR ====================

  async programarMantenimiento(
    vehiculoId: string, 
    dto: ProgramarMantenimientoDto, 
    userId: number
  ): Promise<Mantenimiento> {
    const vehiculo = await this.findOne(vehiculoId);

    // Validar que la fecha no sea en el pasado
    const fechaMantenimiento = new Date(dto.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaMantenimiento.setHours(0, 0, 0, 0);

    if (fechaMantenimiento < hoy) {
      throw new BadRequestException({
        code: 'INVALID_DATE',
        message: 'La fecha del mantenimiento no puede ser en el pasado',
      });
    }

    const mantenimiento = this.mantenimientoRepo.create({
      vehiculoId: vehiculo.id,
      vehiculo,
      fecha: fechaMantenimiento,
      descripcion: dto.descripcion,
      observaciones: dto.observaciones,
      estado: EstadoMantenimiento.PENDIENTE,
      createdBy: userId,
      updatedBy: userId,
    });

    return await this.mantenimientoRepo.save(mantenimiento);
  }

  // ==================== MANTENIMIENTOS - REGISTRAR ====================

  async registrarMantenimiento(
    vehiculoId: string,
    dto: RegistrarMantenimientoDto,
    userId: number
  ): Promise<Mantenimiento> {
    const vehiculo = await this.findOne(vehiculoId);

   
    const fechaMantenimiento = new Date(dto.fecha);
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    fechaMantenimiento.setHours(0, 0, 0, 0);

    if (fechaMantenimiento > hoy) {
      throw new BadRequestException({
        code: 'INVALID_DATE',
        message: 'No puedes registrar un mantenimiento con fecha futura. Usa programar mantenimiento.',
      });
    }

    // Validar que el kilometraje no sea menor al actual del vehículo
    if (dto.kilometraje < vehiculo.kilometraje) {
      throw new BadRequestException({
        code: 'INVALID_KILOMETRAJE',
        message: `El kilometraje (${dto.kilometraje} km) no puede ser menor al actual del vehículo (${vehiculo.kilometraje} km)`,
      });
    }

    // Crear mantenimiento directamente como COMPLETADO
    const mantenimiento = this.mantenimientoRepo.create({
      vehiculoId: vehiculo.id,
      vehiculo,
      fecha: fechaMantenimiento,
      descripcion: dto.descripcion,
      kilometraje: dto.kilometraje,
      tecnico: dto.tecnico,
      costo: dto.costo,
      observaciones: dto.observaciones,
      estado: EstadoMantenimiento.COMPLETADO,
      createdBy: userId,
      updatedBy: userId,
    });

    // Actualizar el kilometraje del vehículo
    vehiculo.kilometraje = dto.kilometraje;
    vehiculo.updatedBy = userId;
    await this.vehiculoRepo.save(vehiculo);

    return await this.mantenimientoRepo.save(mantenimiento);
  }

  // ==================== MANTENIMIENTOS - COMPLETAR ====================

  async completarMantenimiento(
    mantenimientoId: string,
    dto: CompletarMantenimientoDto,
    userId: number
  ): Promise<Mantenimiento> {
    const mantenimiento = await this.mantenimientoRepo.findOne({
      where: { id: mantenimientoId },
      relations: ['vehiculo'],
    });

    if (!mantenimiento) {
      throw new NotFoundException('Mantenimiento no encontrado');
    }

    // Solo se puede completar si está EN_REVISION o PENDIENTE
    if (![EstadoMantenimiento.EN_REVISION, EstadoMantenimiento.PENDIENTE].includes(mantenimiento.estado)) {
      throw new BadRequestException({
        code: 'INVALID_STATE',
        message: 'Solo se pueden completar mantenimientos en estado PENDIENTE o EN_REVISION',
      });
    }

    // Actualizar el mantenimiento con todos los datos
    mantenimiento.kilometraje = dto.kilometraje;
    mantenimiento.tecnico = dto.tecnico;
    mantenimiento.costo = dto.costo;
    mantenimiento.observaciones = dto.observaciones ?? mantenimiento.observaciones;
    mantenimiento.estado = EstadoMantenimiento.COMPLETADO;
    mantenimiento.updatedBy = userId;

    // Actualizar el kilometraje del vehículo
    const vehiculo = mantenimiento.vehiculo;
    vehiculo.kilometraje = dto.kilometraje;
    vehiculo.updatedBy = userId;
    await this.vehiculoRepo.save(vehiculo);

    return await this.mantenimientoRepo.save(mantenimiento);
  }

  // ==================== MANTENIMIENTOS - CAMBIAR ESTADO ====================

  async cambiarEstadoMantenimiento(
    mantenimientoId: string,
    nuevoEstado: EstadoMantenimiento,
    userId: number
  ): Promise<Mantenimiento> {
    const mantenimiento = await this.mantenimientoRepo.findOne({
      where: { id: mantenimientoId },
    });

    if (!mantenimiento) {
      throw new NotFoundException('Mantenimiento no encontrado');
    }

    // Validar transición de estado
    if (nuevoEstado === EstadoMantenimiento.COMPLETADO) {
      throw new BadRequestException({
        code: 'USE_COMPLETAR_ENDPOINT',
        message: 'Para completar un mantenimiento usa el endpoint de completar',
      });
    }

    mantenimiento.estado = nuevoEstado;
    mantenimiento.updatedBy = userId;

    return await this.mantenimientoRepo.save(mantenimiento);
  }

  // ==================== MANTENIMIENTOS - CONSULTAS ====================

  async obtenerHistorial(vehiculoId: string): Promise<Mantenimiento[]> {
    // Incluye mantenimientos aunque el vehículo esté eliminado
    return this.mantenimientoRepo.find({
      where: { vehiculoId },
      order: { fecha: 'DESC' },
      relations: ['vehiculo'],
      withDeleted: true, // Incluye vehículos eliminados
    });
  }



  async obtenerTodosMantenimientos(): Promise<Mantenimiento[]> {
  return this.mantenimientoRepo.find({
    relations: ['vehiculo'],
    order: { fecha: 'DESC' },
    withDeleted: true, // Incluye vehículos eliminados
  });
}

  async obtenerMantenimientosPendientes(): Promise<Mantenimiento[]> {
    return this.mantenimientoRepo.find({
      where: { estado: EstadoMantenimiento.PENDIENTE },
      relations: ['vehiculo'],
      order: { fecha: 'ASC' },
    });
  }

  async obtenerMantenimientosParaNotificar(): Promise<Mantenimiento[]> {
    // Mantenimientos pendientes cuya fecha es mañana
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    manana.setHours(0, 0, 0, 0);

    const pasadoManana = new Date(manana);
    pasadoManana.setDate(pasadoManana.getDate() + 1);

    return this.mantenimientoRepo.find({
      where: {
        estado: EstadoMantenimiento.PENDIENTE,
        fecha: MoreThanOrEqual(manana) && LessThanOrEqual(pasadoManana),
      },
      relations: ['vehiculo'],
    });
  }

  async obtenerMantenimientosDelDia(): Promise<Mantenimiento[]> {
    // Mantenimientos pendientes cuya fecha es HOY
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    return this.mantenimientoRepo.find({
      where: {
        estado: EstadoMantenimiento.PENDIENTE,
        fecha: MoreThanOrEqual(hoy) && LessThanOrEqual(manana),
      },
      relations: ['vehiculo'],
    });
  }

  async obtenerProximoMantenimiento(vehiculoId: string): Promise<Mantenimiento | null> {
    return this.mantenimientoRepo.findOne({
      where: {
        vehiculoId,
        estado: EstadoMantenimiento.PENDIENTE,
      },
      order: { fecha: 'ASC' },
    });
  }

  // ==================== REPORTES DE COSTOS ====================

  async obtenerCostosMensuales(mes: number, anio: number): Promise<{
    total: number;
    mantenimientos: Mantenimiento[];
  }> {
    const inicioMes = new Date(anio, mes - 1, 1);
    const finMes = new Date(anio, mes, 0, 23, 59, 59);

    // Solo mantenimientos COMPLETADOS cuentan para costos
    const mantenimientos = await this.mantenimientoRepo.find({
      where: {
        estado: EstadoMantenimiento.COMPLETADO,
        fecha: MoreThanOrEqual(inicioMes) && LessThanOrEqual(finMes),
      },
      relations: ['vehiculo'],
      withDeleted: true, // Incluye mantenimientos de vehículos eliminados
      order: { fecha: 'DESC' },
    });

    const total = mantenimientos.reduce((sum, m) => sum + Number(m.costo || 0), 0);

    return { total, mantenimientos };
  }

  async obtenerCostosPorVehiculo(vehiculoId: string, mes?: number, anio?: number): Promise<{
    total: number;
    mantenimientos: Mantenimiento[];
  }> {
    const where: any = {
      vehiculoId,
      estado: EstadoMantenimiento.COMPLETADO,
    };

    if (mes && anio) {
      const inicioMes = new Date(anio, mes - 1, 1);
      const finMes = new Date(anio, mes, 0, 23, 59, 59);
      where.fecha = MoreThanOrEqual(inicioMes) && LessThanOrEqual(finMes);
    }

    const mantenimientos = await this.mantenimientoRepo.find({
      where,
      relations: ['vehiculo'],
      withDeleted: true,
      order: { fecha: 'DESC' },
    });

    const total = mantenimientos.reduce((sum, m) => sum + Number(m.costo || 0), 0);

    return { total, mantenimientos };
  }

  // ==================== MANTENIMIENTOS - SOFT DELETE Y RESTAURACIÓN ====================

  async softDeleteMantenimiento(id: string, userId: number): Promise<{ message: string }> {
    const mantenimiento = await this.mantenimientoRepo.findOne({ where: { id } });
    
    if (!mantenimiento) {
      throw new NotFoundException('Mantenimiento no encontrado');
    }

    mantenimiento.deletedBy = userId;
    await this.mantenimientoRepo.save(mantenimiento);
    await this.mantenimientoRepo.softDelete(id);

    return { message: 'Mantenimiento eliminado correctamente' };
  }

  async restoreMantenimiento(id: string, userId: number): Promise<Mantenimiento> {
    const mantenimiento = await this.mantenimientoRepo.findOne({
      where: { id },
      withDeleted: true
    });

    if (!mantenimiento) {
      throw new NotFoundException('Mantenimiento no encontrado');
    }

    if (!mantenimiento.deletedAt) {
      throw new BadRequestException({
        code: 'NOT_DELETED',
        message: 'El mantenimiento no está eliminado',
      });
    }

    await this.mantenimientoRepo.restore(id);

    mantenimiento.updatedBy = userId;
    mantenimiento.deletedBy = null;

    return await this.mantenimientoRepo.save(mantenimiento);
  }

  // ==================== UTILIDADES ====================
  
  async existsByPlaca(placa: string): Promise<{ exists: boolean }> {
    const count = await this.vehiculoRepo.count({ where: { placa } });
    return { exists: count > 0 };
  }
}