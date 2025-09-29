import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Vehiculo } from './entities/vehiculo.entity';
import { Mantenimiento } from './entities/mantenimiento-vehiculo.entity';

import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { EditVehiculoDto } from './dto/edit-vehiculo.dto';
import { MantenimientoVehiculoDto } from './dto/mantenimiento-vehiculo.dto';
import { MantenimientoProgramadoVehiculoDto } from './dto/mantenimiento-programado-vehiculo.dto';
import { ReposicionVehiculoDto } from './dto/reposicion-vehiculo.dto';
import { EstadoVehiculo } from './enums/vehiculo-bomberil.enums';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepo: Repository<Vehiculo>,
    @InjectRepository(Mantenimiento)
    private readonly mantenimientoRepo: Repository<Mantenimiento>,
  ) {}

  // ----------------- Helpers -----------------

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
    if (d > new Date(today.toISOString().slice(0, 10))) {
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

  // ----------------- CRUD BÁSICO -----------------
  
  async findAll(): Promise<Vehiculo[]> {
    return this.vehiculoRepo.find();
  }

  async findOne(id: string): Promise<Vehiculo> {
    const v = await this.vehiculoRepo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Vehículo no encontrado');
    return v;
  }

  async findAllWithDeleted(): Promise<Vehiculo[]> {
    return this.vehiculoRepo.find({ withDeleted: true });
  }

  // ----------------- CREAR -----------------
  
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

  // ----------------- ACTUALIZAR -----------------
  
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

  async updateEstado(id: string, estadoActual: Vehiculo['estadoActual']): Promise<Vehiculo> {
    const vehiculo = await this.findOne(id);
    vehiculo.estadoActual = estadoActual;
    return this.vehiculoRepo.save(vehiculo);
  }

  async darDeBaja(id: string, motivo: string): Promise<Vehiculo> {
    const vehiculo = await this.findOne(id);
    vehiculo.estadoActual = EstadoVehiculo.BAJA;
    vehiculo.observaciones = `${vehiculo.observaciones ?? ''} | Baja: ${motivo}`.trim();
    return this.vehiculoRepo.save(vehiculo);
  }

  // ----------------- SOFT DELETE Y RESTAURACIÓN -----------------

  async softDelete(id: string, userId: number): Promise<{ message: string }> {
    const vehiculo = await this.findOne(id);

    // Verificar que no tenga mantenimientos pendientes críticos
    const mantenimientosPendientes = await this.mantenimientoRepo.count({
      where: { vehiculo: { id } }
    });

    if (mantenimientosPendientes > 0) {
      throw new BadRequestException({
        code: 'HAS_PENDING_MAINTENANCE',
        message: 'No se puede eliminar un vehículo con mantenimientos pendientes',
      });
    }

    // Marcar como eliminado con auditoría
    vehiculo.deletedBy = userId;
    await this.vehiculoRepo.save(vehiculo);

    // Soft delete
    await this.vehiculoRepo.softDelete(id);

    return { message: 'Vehículo eliminado correctamente' };
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

    // Restaurar
    await this.vehiculoRepo.restore(id);

    // Actualizar auditoría
    vehiculo.updatedBy = userId;
    vehiculo.deletedBy = null;
    vehiculo.observaciones = `${vehiculo.observaciones ?? ''} | RESTAURADO por usuario ${userId}`.trim();

    return await this.vehiculoRepo.save(vehiculo);
  }

  // ----------------- REPOSICIÓN -----------------
  
  async registrarReposicion(id: string, dto: ReposicionVehiculoDto): Promise<Vehiculo> {
    const vehiculo = await this.findOne(id);
    vehiculo.reposicionSolicitada = true;
    vehiculo.motivoReposicion = dto.motivo;
    vehiculo.observacionesReposicion = dto.observaciones;
    return this.vehiculoRepo.save(vehiculo);
  }

  // ----------------- MANTENIMIENTOS -----------------
  
  async registrarMantenimiento(id: string, dto: MantenimientoVehiculoDto): Promise<Mantenimiento> {
    const vehiculo = await this.findOne(id);

    vehiculo.kilometraje = dto.kilometraje;
    vehiculo.observaciones = `${vehiculo.observaciones ?? ''} | Mantenimiento: ${dto.descripcion}`.trim();
    await this.vehiculoRepo.save(vehiculo);

    const registro = this.mantenimientoRepo.create({
      ...dto,
      fecha: new Date(dto.fecha),
      vehiculo,
    });
    
    return this.mantenimientoRepo.save(registro);
  }

  async programarMantenimiento(id: string, dto: MantenimientoProgramadoVehiculoDto): Promise<Vehiculo> {
    const vehiculo = await this.findOne(id);
    vehiculo.fechaProximoMantenimiento = new Date(dto.fechaProximoMantenimiento);
    return this.vehiculoRepo.save(vehiculo);
  }

  async obtenerHistorial(id: string): Promise<Mantenimiento[]> {
    return this.mantenimientoRepo.find({
      where: { vehiculo: { id } },
      order: { fecha: 'DESC' },
    });
  }

  // ----------------- UTILIDADES -----------------
  
  async existsByPlaca(placa: string): Promise<{ exists: boolean }> {
    const count = await this.vehiculoRepo.count({ where: { placa } });
    return { exists: count > 0 };
  }
}