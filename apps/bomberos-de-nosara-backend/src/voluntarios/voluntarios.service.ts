/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { User } from '../users/entities/user.entity';
import { RoleEnum } from '../roles/role.enum';
import { Between, Brackets, Repository } from 'typeorm';
import { Participacion } from './entities/participacion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateParticipacionDto } from './dto/CreateParticipacionDto';
import { ActualizarEstadoDto } from './dto/ActualizarEstadoDto';
import { FiltrosParticipacionDto } from './dto/FiltrosParticipacionDto';

@Injectable()
export class VoluntariosService {
  constructor(
    @InjectRepository(Participacion)
    private readonly participacionRepo: Repository<Participacion>,
  ) {}

  private verificarRolVoluntario(user: any): boolean {
    return user.roles?.includes(RoleEnum.VOLUNTARIO);
  }

  // ----- VOLUNTARIO ------

  private calcularHoras(horaInicio: string, horaFin: string): number {
    const [hi, mi] = horaInicio.split(':').map(Number);
    const [hf, mf] = horaFin.split(':').map(Number);

    const inicio = new Date(0, 0, 0, hi, mi);
    const fin = new Date(0, 0, 0, hf, mf);

    const diffMs = fin.getTime() - inicio.getTime();
    const horas = diffMs / (1000 * 60 * 60);
    return Math.round(horas * 100) / 100; //
  }

  async crearParticipacion(
    user: User,
    dto: CreateParticipacionDto,
  ): Promise<any> {
    if (!this.verificarRolVoluntario(user)) {
      throw new UnauthorizedException(
        'Solo usuarios con rol VOLUNTARIO pueden registrar participaciones',
      );
    }

    // Validar que horaFin sea mayor que horaInicio
    const horas = this.calcularHoras(dto.horaInicio, dto.horaFin);
    if (horas <= 0) {
      throw new BadRequestException('horaFin debe ser mayor que horaInicio');
    }

    const participacion = this.participacionRepo.create({
      voluntario: user,
      actividad: dto.actividad,
      fecha: new Date(dto.fecha),
      horaInicio: dto.horaInicio,
      horaFin: dto.horaFin,
      descripcion: dto.descripcion,
      ubicacion: dto.ubicacion,
      estado: 'pendiente',
    });

    const saved = await this.participacionRepo.save(participacion);
    return {
      ...saved,
      horasRegistradas: this.calcularHoras(saved.horaInicio, saved.horaFin),
    };
  }

  //Service para listar el historial de participaciones de un voluntario
  async listarHistorial(user: User, estado?: string): Promise<any[]> {
    const where: any = { voluntario: { id: user.id } };
    if (estado) where.estado = estado;

    const participaciones = await this.participacionRepo.find({
      where,
      order: { fecha: 'DESC' },
    });

    return participaciones.map((p) => ({
      ...p,
      horasRegistradas: this.calcularHoras(p.horaInicio, p.horaFin),
    }));
  }

  // ----- ADMIN ------

  // Service para listar todas las participaciones (admin)
  // async listarTodasParticipaciones(estado?: string): Promise<any[]> {
  //   const where: any = {};
  //   if (estado) where.estado = estado;

  //   const participaciones = await this.participacionRepo.find({
  //     where,
  //     order: { fecha: 'DESC' },
  //   });

  //   return participaciones.map((p) => ({
  //     ...p,
  //     horasRegistradas: this.calcularHoras(p.horaInicio, p.horaFin),
  //   }));
  // }

  // ----- ADMIN ------
  //Service para el administrador que actualiza el estado de una participación
  async actualizarEstadoParticipacion(
    id: number,
    dto: ActualizarEstadoDto,
  ): Promise<any> {
    const participacion = await this.participacionRepo.findOne({
      where: { id },
    });
    if (!participacion) {
      throw new NotFoundException('Participación no encontrada');
    }

    if (
      dto.estado === 'rechazada' &&
      (!dto.motivoRechazo || dto.motivoRechazo.trim() === '')
    ) {
      throw new BadRequestException('Debe indicar el motivo del rechazo');
    }

    participacion.estado = dto.estado;
    participacion.motivoRechazo =
      dto.estado === 'rechazada' ? dto.motivoRechazo : undefined;

    const saved = await this.participacionRepo.save(participacion);
    return {
      ...saved,
      horasRegistradas: this.calcularHoras(saved.horaInicio, saved.horaFin),
    };
  }

  //Service que obtiene las horas con estado 'aprobada' de un voluntario
  async obtenerHorasAprobadasPorVoluntario(userId: number): Promise<number> {
    const participaciones = await this.participacionRepo.find({
      where: { voluntario: { id: userId }, estado: 'aprobada' },
    });

    return participaciones.reduce((total, p) => {
      return total + this.calcularHoras(p.horaInicio, p.horaFin);
    }, 0);
  }

  //Service que obtiene las horas con estado 'pendiente' de un voluntario
  async obtenerHorasPendientesPorVoluntario(userId: number): Promise<number> {
    const participaciones = await this.participacionRepo.find({
      where: { voluntario: { id: userId }, estado: 'pendiente' },
    });

    return participaciones.reduce((total, p) => {
      return total + this.calcularHoras(p.horaInicio, p.horaFin);
    }, 0);
  }

  // Service que obtiene estadísticas generales para el dashboard del admin
  async obtenerEstadisticasGenerales(): Promise<any> {
    // 1. Solo aprobadas (sin filtro de mes)
    const aprobadas = await this.participacionRepo.find({
      where: { estado: 'aprobada' },
      relations: ['voluntario'],
    });

    // 2. Total de horas
    const totalHoras = aprobadas.reduce(
      (sum, p) => sum + this.calcularHoras(p.horaInicio, p.horaFin),
      0,
    );

    // 3. Voluntarios únicos
    const voluntariosActivos = new Set(aprobadas.map((p) => p.voluntario.id))
      .size;

    // 4. Promedio
    const promedioHorasPorVoluntario =
      voluntariosActivos > 0 ? totalHoras / voluntariosActivos : 0;

    // 5. Tasa de aprobación (todos los tiempos)
    const totalRegistros = await this.participacionRepo.count();
    const tasaAprobacion =
      totalRegistros > 0 ? (aprobadas.length / totalRegistros) * 100 : 0;

    // 6. Todos los voluntarios (sin .slice)
    const horasPorVoluntario: Record<
      number,
      { nombre: string; horas: number }
    > = {};
    aprobadas.forEach((p) => {
      const id = p.voluntario.id;
      const nombre = p.voluntario.username;
      const horas = this.calcularHoras(p.horaInicio, p.horaFin);
      if (!horasPorVoluntario[id]) {
        horasPorVoluntario[id] = { nombre, horas: 0 };
      }
      horasPorVoluntario[id].horas += horas;
    });

    const topVoluntarios = Object.values(horasPorVoluntario).sort(
      (a, b) => b.horas - a.horas,
    ); // ← sin .slice

    // 7. Por tipo
    const participacionesPorTipo = {
      Entrenamiento: 0,
      Emergencia: 0,
      Simulacros: 0,
    };
    aprobadas.forEach((p) => {
      if (p.actividad in participacionesPorTipo) {
        participacionesPorTipo[p.actividad]++;
      }
    });

    return {
      totalHoras: parseFloat(totalHoras.toFixed(2)),
      voluntariosActivos,
      promedioHorasPorVoluntario: parseFloat(
        promedioHorasPorVoluntario.toFixed(1),
      ),
      tasaAprobacion: parseFloat(tasaAprobacion.toFixed(1)),
      topVoluntarios, // ← TODOS
      participacionesPorTipo,
    };
  }

  // Service que obtiene estadísticas mensuales para el dashboard del admin
  async obtenerEstadisticasMensuales(mes: string): Promise<any> {
    const [year, month] = mes.split('-').map(Number);
    const inicio = new Date(year, month - 1, 1);
    const fin = new Date(year, month, 0, 23, 59, 59);

    // Solo aprobadas del mes
    const aprobadas = await this.participacionRepo.find({
      where: {
        estado: 'aprobada',
        fecha: Between(inicio, fin),
      },
      relations: ['voluntario'],
    });

    // Total de horas
    const totalHoras = aprobadas.reduce(
      (sum, p) => sum + this.calcularHoras(p.horaInicio, p.horaFin),
      0,
    );

    // Voluntarios únicos
    const voluntariosActivos = new Set(aprobadas.map((p) => p.voluntario.id))
      .size;

    // Promedio de horas por voluntario
    const promedioHorasPorVoluntario =
      voluntariosActivos > 0 ? totalHoras / voluntariosActivos : 0;

    // Top 5 voluntarios
    const horasPorVoluntario: Record<
      number,
      { nombre: string; horas: number }
    > = {};
    aprobadas.forEach((p) => {
      const id = p.voluntario.id;
      const nombre = p.voluntario.username;
      const horas = this.calcularHoras(p.horaInicio, p.horaFin);
      if (!horasPorVoluntario[id]) {
        horasPorVoluntario[id] = { nombre, horas: 0 };
      }
      horasPorVoluntario[id].horas += horas;
    });

    const topVoluntarios = Object.values(horasPorVoluntario)
      .sort((a, b) => b.horas - a.horas)
      .slice(0, 5);

    // Contador por tipo
    const participacionesPorTipo = {
      Entrenamiento: 0,
      Emergencia: 0,
      Simulacros: 0,
    };

    aprobadas.forEach((p) => {
      if (p.actividad in participacionesPorTipo) {
        participacionesPorTipo[p.actividad]++;
      }
    });

    // Tasa de aprobación
    const totalRegistros = await this.participacionRepo.count({
      where: {
        fecha: Between(inicio, fin),
      },
    });

    const tasaAprobacion =
      totalRegistros > 0 ? (aprobadas.length / totalRegistros) * 100 : 0;

    return {
      totalHoras: parseFloat(totalHoras.toFixed(2)),
      voluntariosActivos,
      promedioHorasPorVoluntario: parseFloat(
        promedioHorasPorVoluntario.toFixed(1),
      ),
      tasaAprobacion: parseFloat(tasaAprobacion.toFixed(1)),
      topVoluntarios,
      participacionesPorTipo,
    };
  }

  // Service que lista todas las participaciones con paginación y filtros (admin)
  async listarTodasPaginado(dto: FiltrosParticipacionDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const query = this.participacionRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.voluntario', 'voluntario')
      .orderBy('p.fecha', 'DESC');

    if (dto.descripcion) {
      console.log('[FILTRO] descripcion:', dto.descripcion);
      query.andWhere(
        new Brackets((qb) =>
          qb.where('p.actividad LIKE :txt').orWhere('p.descripcion LIKE :txt'),
        ),
        { txt: `%${dto.descripcion}%` },
      );
    }

    if (dto.voluntario) {
      console.log('[FILTRO] voluntario:', dto.voluntario);
      query.andWhere('voluntario.username LIKE :nombre', {
        nombre: `%${dto.voluntario}%`,
      });
    }

    if (dto.tipoActividad) {
      console.log('[FILTRO] tipoActividad:', dto.tipoActividad);
      query.andWhere('p.actividad = :tipo', { tipo: dto.tipoActividad });
    }

    if (dto.fechaDesde) {
      query.andWhere('p.fecha >= :desde', { desde: dto.fechaDesde });
    }

    if (dto.fechaHasta) {
      query.andWhere('p.fecha <= :hasta', { hasta: dto.fechaHasta });
    }

    if (dto.estado) {
      query.andWhere('p.estado = :estado', { estado: dto.estado });
    }

    console.log('Query SQL:', query.getQuery());
    console.log('Parámetros:', query.getParameters());

    const total = await query.getCount();
    const result = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: result.map((p) => ({
        ...p,
        horasRegistradas: this.calcularHoras(p.horaInicio, p.horaFin),
      })),
      total,
      page: dto.page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
