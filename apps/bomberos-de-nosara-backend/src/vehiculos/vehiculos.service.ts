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
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
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
  private isDuplicateError(err: any) {
    // MySQL / MariaDB
    return err?.errno === 1062 || err?.code === 'ER_DUP_ENTRY';
  }

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
      // compara contra hoy (00:00) de forma segura
      throw new BadRequestException({
        code: 'DATE_IN_FUTURE',
        field,
        message: `La ${field} no puede ser mayor a hoy`,
      });
    }
    return d;
  }

  // ----------------- CRUD -----------------
  async findAll(): Promise<Vehiculo[]> {
    return this.vehiculoRepo.find();
  }

  async findOne(id: string): Promise<Vehiculo> {
    const v = await this.vehiculoRepo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Vehículo no encontrado');
    return v;
  }

  async create(dto: CreateVehiculoDto): Promise<Vehiculo> {
    // Validación de fecha (no futura)
    const fechaAdq = this.ensurePastOrToday(dto.fechaAdquisicion, 'fechaAdquisicion');

    try {
      const entity = this.vehiculoRepo.create({
        ...dto,
        placa: dto.placa?.trim(),
        fechaAdquisicion: fechaAdq,
      });
      return await this.vehiculoRepo.save(entity);
    } catch (err) {
      if (this.isDuplicateError(err)) {
        throw new ConflictException({
          code: 'PLATE_EXISTS',
          field: 'placa',
          message: 'La placa ya está registrada',
        });
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateVehiculoDto): Promise<Vehiculo> {
    const vehiculo = await this.findOne(id);

    // Si viene fecha, valida que no sea futura
    let fechaAdq = vehiculo.fechaAdquisicion;
    if (dto.fechaAdquisicion) {
      fechaAdq = this.ensurePastOrToday(dto.fechaAdquisicion, 'fechaAdquisicion');
    }

    try {
      Object.assign(vehiculo, {
        ...dto,
        placa: dto.placa?.trim() ?? vehiculo.placa,
        fechaAdquisicion: fechaAdq,
      });
      return await this.vehiculoRepo.save(vehiculo);
    } catch (err) {
      if (this.isDuplicateError(err)) {
        // Esto cubre el caso de intentar cambiar la placa a una ya existente
        throw new ConflictException({
          code: 'PLATE_EXISTS',
          field: 'placa',
          message: 'La placa ya está registrada',
        });
      }
      throw err;
    }
  }

  async updateEstado(id: string, estadoActual: Vehiculo['estadoActual']) {
    const vehiculo = await this.findOne(id);
    vehiculo.estadoActual = estadoActual;
    return this.vehiculoRepo.save(vehiculo);
  }

  async darDeBaja(id: string, motivo: string) {
    const vehiculo = await this.findOne(id);
    vehiculo.estadoActual = EstadoVehiculo.BAJA;
    vehiculo.observaciones = `${vehiculo.observaciones ?? ''} | Baja: ${motivo}`.trim();
    return this.vehiculoRepo.save(vehiculo);
  }

  async registrarReposicion(id: string, dto: ReposicionVehiculoDto) {
    const vehiculo = await this.findOne(id);
    vehiculo.reposicionSolicitada = true;
    vehiculo.motivoReposicion = dto.motivo;
    vehiculo.observacionesReposicion = dto.observaciones;
    return this.vehiculoRepo.save(vehiculo);
  }

  // ----------------- Mantenimientos -----------------
  // registra mantenimiento en historial
  async registrarMantenimiento(id: string, dto: MantenimientoVehiculoDto) {
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

  async programarMantenimiento(id: string, dto: MantenimientoProgramadoVehiculoDto) {
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

  // ----------------- (Opcional) validación asíncrona de placa -----------------
  async existsByPlaca(placa: string): Promise<{ exists: boolean }> {
    const count = await this.vehiculoRepo.count({ where: { placa } });
    return { exists: count > 0 };
  }
}
