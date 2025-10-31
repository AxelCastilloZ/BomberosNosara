import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

import { EquipoBomberil } from './entities/equipo-bomberil.entity';
import { MantenimientoEquipo } from './entities/equipo-mantenimiento.entity';

import { CreateEquipoDto } from './dto/create-equipo.dto';
import { EditEquipoDto } from './dto/edit-equipo.dto';
import { ProgramarMantenimientoDto } from './dto/programar-mantenimiento.dto';
import { RegistrarMantenimientoDto } from './dto/registrar-mantenimiento.dto';
import { CompletarMantenimientoDto } from './dto/completar-mantenimiento.dto';
import { PaginatedEquipoQueryDto } from './dto/paginated-query.dto';
import { PaginatedEquipoResponseDto } from './dto/paginated-response.dto';
import { EstadoEquipo } from './enums/equipo-bomberil.enums';
import { EstadoMantenimiento } from './enums/mantenimiento.enums';
import { EditMantenimientoDto } from './dto/edit-mantenimiento.dto';

@Injectable()
export class EquipoBomberilService {
  constructor(
    @InjectRepository(EquipoBomberil)
    private readonly equipoRepo: Repository<EquipoBomberil>,
    @InjectRepository(MantenimientoEquipo)
    private readonly mantenimientoRepo: Repository<MantenimientoEquipo>,
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
   * Agrega una línea al log de observaciones del equipo
   */
  private agregarObservacion(equipo: EquipoBomberil, nuevaLinea: string): void {
    if (equipo.observaciones) {
      equipo.observaciones = `${equipo.observaciones}\n${nuevaLinea}`;
    } else {
      equipo.observaciones = nuevaLinea;
    }
  }

  /**
   * Valida transiciones de estado según las reglas de negocio
   */
  private async validateStateTransition(
    currentState: EstadoEquipo,
    newState: EstadoEquipo,
  ): Promise<void> {
    // Validar transiciones válidas
    const validTransitions: Record<EstadoEquipo, EstadoEquipo[]> = {
      [EstadoEquipo.EN_SERVICIO]: [
        EstadoEquipo.MALO,
        EstadoEquipo.FUERA_DE_SERVICIO,
        EstadoEquipo.BAJA
      ],
      [EstadoEquipo.MALO]: [
        EstadoEquipo.EN_SERVICIO,
        EstadoEquipo.FUERA_DE_SERVICIO,
        EstadoEquipo.BAJA
      ],
      [EstadoEquipo.FUERA_DE_SERVICIO]: [
        EstadoEquipo.EN_SERVICIO,
        EstadoEquipo.MALO,
        EstadoEquipo.BAJA
      ],
      [EstadoEquipo.BAJA]: [
        EstadoEquipo.EN_SERVICIO,
        EstadoEquipo.MALO,
        EstadoEquipo.FUERA_DE_SERVICIO
      ]
    };

    if (!validTransitions[currentState]?.includes(newState)) {
      throw new BadRequestException({
        code: 'INVALID_STATE_TRANSITION',
        message: `No se puede cambiar de ${currentState} a ${newState}`,
      });
    }
  }

  // ==================== CRUD BÁSICO EQUIPOS ====================
  
  async findAll(): Promise<EquipoBomberil[]> {
    return this.equipoRepo.find();
  }

  async findAllPaginated(query: PaginatedEquipoQueryDto): Promise<PaginatedEquipoResponseDto> {
    const { page = 1, limit = 10, search, status, type } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    // Búsqueda en numeroSerie O nombre
    if (search) {
      where.OR = [
        { numeroSerie: Like(`%${search}%`) },
        { nombre: Like(`%${search}%`) }
      ];
    }

    if (status) {
      where.estadoActual = status;
    }

    if (type) {
      where.tipo = type;
    }

    const [data, total] = await this.equipoRepo.findAndCount({
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

  async findOne(id: string): Promise<EquipoBomberil> {
    const equipo = await this.equipoRepo.findOne({ where: { id } });
    if (!equipo) throw new NotFoundException('Equipo no encontrado');
    return equipo;
  }

  async findAllWithDeleted(): Promise<EquipoBomberil[]> {
    return this.equipoRepo.find({ withDeleted: true });
  }

  async create(dto: CreateEquipoDto, userId: number): Promise<EquipoBomberil> {
    const fechaAdq = this.ensurePastOrToday(dto.fechaAdquisicion, 'fechaAdquisicion');

    const entity = this.equipoRepo.create({
      ...dto,
      numeroSerie: dto.numeroSerie?.trim(),
      nombre: dto.nombre?.trim(),
      fechaAdquisicion: fechaAdq,
      createdBy: userId,
      updatedBy: userId,
    });
    
    return await this.equipoRepo.save(entity);
  }

  async edit(id: string, dto: EditEquipoDto, userId: number): Promise<EquipoBomberil> {
    const equipo = await this.findOne(id);

    // Si viene fecha, valida que no sea futura
    let fechaAdq = equipo.fechaAdquisicion;
    if (dto.fechaAdquisicion) {
      fechaAdq = this.ensurePastOrToday(dto.fechaAdquisicion, 'fechaAdquisicion');
    }

    Object.assign(equipo, {
      ...dto,
      numeroSerie: dto.numeroSerie?.trim() ?? equipo.numeroSerie,
      nombre: dto.nombre?.trim() ?? equipo.nombre,
      fechaAdquisicion: fechaAdq,
      updatedBy: userId,
    });

    return await this.equipoRepo.save(equipo);
  }
 
  async updateEstado(id: string, estadoActual: EquipoBomberil['estadoActual'], userId: number): Promise<EquipoBomberil> {
    const equipo = await this.findOne(id);
    
    const estadoAnterior = equipo.estadoActual;
    
    // Validar transición
    await this.validateStateTransition(equipo.estadoActual, estadoActual);
    
    // 🔥 AGREGAR AL LOG
    const fecha = new Date().toLocaleDateString('es-CR');
    this.agregarObservacion(
      equipo, 
      `${fecha} - Cambio de estado: ${estadoAnterior} → ${estadoActual}`
    );
    
    equipo.estadoActual = estadoActual;
    equipo.updatedBy = userId;
    
    return this.equipoRepo.save(equipo);
  }

  async darDeBaja(id: string, motivo: string, userId: number): Promise<EquipoBomberil> {
    const equipo = await this.findOne(id);
    
    // Log de la baja
    const fecha = new Date().toLocaleDateString('es-CR');
    this.agregarObservacion(
      equipo, 
      `${fecha} - DADO DE BAJA | Motivo: ${motivo}`
    );
    
    equipo.estadoActual = EstadoEquipo.BAJA;
    equipo.updatedBy = userId;
    
    return this.equipoRepo.save(equipo);
  }

  // ==================== SOFT DELETE Y RESTAURACIÓN ====================

 async softDelete(id: string, userId: number): Promise<{ message: string }> {
  const equipo = await this.findOne(id);

  // 🔥 VALIDAR QUE NO TENGA MANTENIMIENTOS PENDIENTES
  const mantenimientosPendientes = await this.mantenimientoRepo.count({
    where: [
      { equipoId: id, estado: EstadoMantenimiento.PENDIENTE },
      { equipoId: id, estado: EstadoMantenimiento.EN_REVISION }
    ]
  });

  if (mantenimientosPendientes > 0) {
    throw new BadRequestException({
      code: 'HAS_PENDING_MAINTENANCE',
      message: `No se puede eliminar el equipo porque tiene ${mantenimientosPendientes} mantenimiento(s) pendiente(s). Por favor, elimine o complete los mantenimientos primero.`,
      count: mantenimientosPendientes
    });
  }

  equipo.deletedBy = userId;
  await this.equipoRepo.save(equipo);
  await this.equipoRepo.softDelete(id);

  return { 
    message: 'Equipo eliminado correctamente. Los mantenimientos completados se mantienen para reportes de costos.' 
  };
}

  async restore(id: string, userId: number): Promise<EquipoBomberil> {
    const equipo = await this.equipoRepo.findOne({
      where: { id },
      withDeleted: true
    });

    if (!equipo) {
      throw new NotFoundException('Equipo no encontrado');
    }

    if (!equipo.deletedAt) {
      throw new BadRequestException({
        code: 'NOT_DELETED',
        message: 'El equipo no está eliminado',
      });
    }

    await this.equipoRepo.restore(id);

    // Log de restauración
    const fecha = new Date().toLocaleDateString('es-CR');
    this.agregarObservacion(equipo, `${fecha} - Equipo RESTAURADO`);

    equipo.updatedBy = userId;
    equipo.deletedBy = null;

    return await this.equipoRepo.save(equipo);
  }

  // ==================== MANTENIMIENTOS - PROGRAMAR ====================

  async programarMantenimiento(
    equipoId: string, 
    dto: ProgramarMantenimientoDto, 
    userId: number
  ): Promise<MantenimientoEquipo> {
    const equipo = await this.findOne(equipoId);

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
      equipoId: equipo.id,
      equipo,
      tipo: dto.tipo,
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
    equipoId: string,
    dto: RegistrarMantenimientoDto,
    userId: number
  ): Promise<MantenimientoEquipo> {
    const equipo = await this.findOne(equipoId);

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

    // Crear mantenimiento directamente como COMPLETADO
    const mantenimiento = this.mantenimientoRepo.create({
      equipoId: equipo.id,
      equipo,
      tipo: dto.tipo,
      fecha: fechaMantenimiento,
      descripcion: dto.descripcion,
      tecnico: dto.tecnico,
      costo: dto.costo,
      observaciones: dto.observaciones,
      estado: EstadoMantenimiento.COMPLETADO,
      createdBy: userId,
      updatedBy: userId,
    });

    // 🔥 AGREGAR AL LOG DE OBSERVACIONES DEL EQUIPO
    const fecha = fechaMantenimiento.toLocaleDateString('es-CR');
    const costoFormateado = dto.costo ? `₡${dto.costo.toLocaleString('es-CR')}` : 'N/A';
    const tipoLabel = dto.tipo === 'preventivo' ? '[PREVENTIVO]' : '[CORRECTIVO]';
    this.agregarObservacion(
      equipo,
      `${fecha} - ${dto.descripcion} ${tipoLabel} | Costo: ${costoFormateado} | Técnico: ${dto.tecnico}`
    );

    equipo.updatedBy = userId;
    await this.equipoRepo.save(equipo);

    return await this.mantenimientoRepo.save(mantenimiento);
  }

  // ==================== MANTENIMIENTOS - COMPLETAR ====================

  async completarMantenimiento(
    mantenimientoId: string,
    dto: CompletarMantenimientoDto,
    userId: number
  ): Promise<MantenimientoEquipo> {
    const mantenimiento = await this.mantenimientoRepo.findOne({
      where: { id: mantenimientoId },
      relations: ['equipo'],
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
    mantenimiento.tecnico = dto.tecnico;
    mantenimiento.costo = dto.costo;
    mantenimiento.observaciones = dto.observaciones ?? mantenimiento.observaciones;
    mantenimiento.estado = EstadoMantenimiento.COMPLETADO;
    mantenimiento.updatedBy = userId;

    // 🔥 AGREGAR AL LOG DE OBSERVACIONES DEL EQUIPO
    const equipo = mantenimiento.equipo;
    const fecha = new Date().toLocaleDateString('es-CR');
    const costoFormateado = dto.costo ? `₡${dto.costo.toLocaleString('es-CR')}` : 'N/A';
    const tipoLabel = mantenimiento.tipo === 'preventivo' ? '[PREVENTIVO]' : '[CORRECTIVO]';
    this.agregarObservacion(
      equipo,
      `${fecha} - ${mantenimiento.descripcion} ${tipoLabel} [COMPLETADO] | Costo: ${costoFormateado} | Técnico: ${dto.tecnico}`
    );

    equipo.updatedBy = userId;
    await this.equipoRepo.save(equipo);

    return await this.mantenimientoRepo.save(mantenimiento);
  }

  // ==================== MANTENIMIENTOS - CAMBIAR ESTADO ====================

  async cambiarEstadoMantenimiento(
    mantenimientoId: string,
    nuevoEstado: EstadoMantenimiento,
    userId: number
  ): Promise<MantenimientoEquipo> {
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

  async obtenerHistorial(equipoId: string): Promise<MantenimientoEquipo[]> {
    return this.mantenimientoRepo.find({
      where: { equipoId },
      order: { fecha: 'DESC' },
      relations: ['equipo'],
    
    });
  }

  async obtenerTodosMantenimientos(): Promise<MantenimientoEquipo[]> {
    return this.mantenimientoRepo.find({
      relations: ['equipo'],
      order: { fecha: 'DESC' },
      
    });
  }

  async obtenerMantenimientosPendientes(): Promise<MantenimientoEquipo[]> {
    return this.mantenimientoRepo.find({
      where: { estado: EstadoMantenimiento.PENDIENTE },
      relations: ['equipo'],
      order: { fecha: 'ASC' },
    });
  }

  async obtenerMantenimientosParaNotificar(): Promise<MantenimientoEquipo[]> {
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
      relations: ['equipo'],
    });
  }

  async obtenerMantenimientosDelDia(): Promise<MantenimientoEquipo[]> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    return this.mantenimientoRepo.find({
      where: {
        estado: EstadoMantenimiento.PENDIENTE,
        fecha: MoreThanOrEqual(hoy) && LessThanOrEqual(manana),
      },
      relations: ['equipo'],
    });
  }

  async obtenerProximoMantenimiento(equipoId: string): Promise<MantenimientoEquipo | null> {
    return this.mantenimientoRepo.findOne({
      where: {
        equipoId,
        estado: EstadoMantenimiento.PENDIENTE,
      },
      order: { fecha: 'ASC' },
    });
  }

  // ==================== REPORTES DE COSTOS ====================

  async obtenerCostosMensuales(mes: number, anio: number): Promise<{
    total: number;
    mantenimientos: MantenimientoEquipo[];
  }> {
    const inicioMes = new Date(anio, mes - 1, 1);
    const finMes = new Date(anio, mes, 0, 23, 59, 59);

    const mantenimientos = await this.mantenimientoRepo.find({
      where: {
        estado: EstadoMantenimiento.COMPLETADO,
        fecha: MoreThanOrEqual(inicioMes) && LessThanOrEqual(finMes),
      },
      relations: ['equipo'],
      withDeleted: true,
      order: { fecha: 'DESC' },
    });

    const total = mantenimientos.reduce((sum, m) => sum + Number(m.costo || 0), 0);

    return { total, mantenimientos };
  }

  async obtenerCostosPorEquipo(equipoId: string, mes?: number, anio?: number): Promise<{
    total: number;
    mantenimientos: MantenimientoEquipo[];
  }> {
    const where: any = {
      equipoId,
      estado: EstadoMantenimiento.COMPLETADO,
    };

    if (mes && anio) {
      const inicioMes = new Date(anio, mes - 1, 1);
      const finMes = new Date(anio, mes, 0, 23, 59, 59);
      where.fecha = MoreThanOrEqual(inicioMes) && LessThanOrEqual(finMes);
    }

    const mantenimientos = await this.mantenimientoRepo.find({
      where,
      relations: ['equipo'],
      withDeleted: true,
      order: { fecha: 'DESC' },
    });

    const total = mantenimientos.reduce((sum, m) => sum + Number(m.costo || 0), 0);

    return { total, mantenimientos };
  }





async editarMantenimiento(
  mantenimientoId: string,
  dto: EditMantenimientoDto,
  userId: number
): Promise<MantenimientoEquipo> {
  const mantenimiento = await this.mantenimientoRepo.findOne({
    where: { id: mantenimientoId },
    relations: ['equipo'],
  });

  if (!mantenimiento) {
    throw new NotFoundException('Mantenimiento no encontrado');
  }

  // Actualizar solo los campos que vienen en el DTO
  if (dto.descripcion !== undefined) {
    mantenimiento.descripcion = dto.descripcion;
  }
  if (dto.fecha !== undefined) {
    mantenimiento.fecha = new Date(dto.fecha);
  }
  if (dto.observaciones !== undefined) {
    mantenimiento.observaciones = dto.observaciones;
  }
  if (dto.tecnico !== undefined) {
    mantenimiento.tecnico = dto.tecnico;
  }
  if (dto.costo !== undefined) {
    mantenimiento.costo = dto.costo;
  }

  mantenimiento.updatedBy = userId;

  return await this.mantenimientoRepo.save(mantenimiento);
}










  // ==================== MANTENIMIENTOS - SOFT DELETE Y RESTAURACIÓN ====================












  async softDeleteMantenimiento(id: string, userId: number): Promise<{ message: string }> {
  const mantenimiento = await this.mantenimientoRepo.findOne({ 
    where: { id },
    withDeleted: true  // 👈 AGREGAR ESTO
  });
  
  if (!mantenimiento) {
    throw new NotFoundException('Mantenimiento no encontrado');
  }

  // 🔥 Validar que el mantenimiento no esté ya eliminado
  if (mantenimiento.deletedAt) {
    throw new BadRequestException({
      code: 'ALREADY_DELETED',
      message: 'El mantenimiento ya está eliminado'
    });
  }

  mantenimiento.deletedBy = userId;
  await this.mantenimientoRepo.save(mantenimiento);
  await this.mantenimientoRepo.softDelete(id);

  return { message: 'Mantenimiento eliminado correctamente' };
}

  async restoreMantenimiento(id: string, userId: number): Promise<MantenimientoEquipo> {
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
  
  async existsByNumeroSerie(numeroSerie: string): Promise<{ exists: boolean }> {
    const count = await this.equipoRepo.count({ where: { numeroSerie } });
    return { exists: count > 0 };
  }
}