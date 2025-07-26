import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findAll(): Promise<Vehiculo[]> {
    return this.vehiculoRepo.find();
  }

  async findOne(id: string): Promise<Vehiculo> {
    const v = await this.vehiculoRepo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Vehículo no encontrado');
    return v;
  }

  async create(dto: CreateVehiculoDto): Promise<Vehiculo> {
    const entity = this.vehiculoRepo.create({
      ...dto,
      fechaAdquisicion: new Date(dto.fechaAdquisicion),
    });
    return this.vehiculoRepo.save(entity);
  }

  async update(id: string, dto: UpdateVehiculoDto): Promise<Vehiculo> {
    const vehiculo = await this.findOne(id);
    Object.assign(vehiculo, {
      ...dto,
      fechaAdquisicion: dto.fechaAdquisicion ? new Date(dto.fechaAdquisicion) : vehiculo.fechaAdquisicion,
    });
    return this.vehiculoRepo.save(vehiculo);
  }

  async updateEstado(id: string, estadoActual: Vehiculo['estadoActual']) {
    const vehiculo = await this.findOne(id);
    vehiculo.estadoActual = estadoActual;
    return this.vehiculoRepo.save(vehiculo);
  }

  async darDeBaja(id: string, motivo: string) {
    const vehiculo = await this.findOne(id);
    vehiculo.estadoActual = EstadoVehiculo.BAJA;
    vehiculo.observaciones = `${vehiculo.observaciones ?? ''} | Baja: ${motivo}`;
    return this.vehiculoRepo.save(vehiculo);
  }

  async registrarReposicion(id: string, dto: ReposicionVehiculoDto) {
    const vehiculo = await this.findOne(id);
    vehiculo.reposicionSolicitada = true;
    vehiculo.motivoReposicion = dto.motivo;
    vehiculo.observacionesReposicion = dto.observaciones;
    return this.vehiculoRepo.save(vehiculo);
  }

  // ✅ ACTUALIZA el vehículo + registra mantenimiento en historial
  async registrarMantenimiento(id: string, dto: MantenimientoVehiculoDto) {
    const vehiculo = await this.findOne(id);

    // Actualiza el vehículo con datos actuales
    vehiculo.kilometraje = dto.kilometraje;
    vehiculo.observaciones = `${vehiculo.observaciones ?? ''} | Mantenimiento: ${dto.descripcion}`;
    await this.vehiculoRepo.save(vehiculo);

    // Guarda historial
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

  // ✅ Obtiene historial de mantenimientos
  async obtenerHistorial(id: string): Promise<Mantenimiento[]> {
    return this.mantenimientoRepo.find({
      where: { vehiculo: { id } },
      order: { fecha: 'DESC' },
    });
  }
}
