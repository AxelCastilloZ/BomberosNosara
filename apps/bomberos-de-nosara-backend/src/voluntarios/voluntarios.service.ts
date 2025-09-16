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
import { Brackets, Repository } from 'typeorm';
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
  async obtenerEstadisticasGenerales(mes?: string): Promise<any> {
    let inicio: Date | null = null;
    let fin: Date | null = null;

    // Si llega "mes" en formato "YYYY-MM" calculamos inicio/fin del mes
    if (mes) {
      const [year, month] = mes.split('-').map(Number);
      inicio = new Date(year, month - 1, 1);
      fin = new Date(year, month, 0, 23, 59, 59); // último día del mes
    }

    // Query base: solo aprobadas
    const query = this.participacionRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.voluntario', 'voluntario')
      .where('p.estado = :estado', { estado: 'aprobada' });

    // Filtro opcional por mes

    if (mes && inicio && fin) {
      query.andWhere('p.fecha BETWEEN :inicio AND :fin', { inicio, fin });
    }

    const aprobadas = await query.getMany();

    // ----- cálculos idénticos a los que ya tenías -----
    const totalHoras = aprobadas.reduce(
      (sum, p) => sum + this.calcularHoras(p.horaInicio, p.horaFin),
      0,
    );

    const voluntariosActivos = new Set(aprobadas.map((p) => p.voluntario.id))
      .size;

    const promedioHorasPorVoluntario =
      voluntariosActivos > 0 ? totalHoras / voluntariosActivos : 0;

    // Para la tasa necesitamos el total de registros (todos los estados)
    const totalQuery = this.participacionRepo.createQueryBuilder('p');
    if (mes) {
      totalQuery.where('p.fecha BETWEEN :inicio AND :fin', { inicio, fin });
    }
    const totalRegistros = await totalQuery.getCount();

    const tasaAprobacion =
      totalRegistros > 0 ? (aprobadas.length / totalRegistros) * 100 : 0;

    // Top 10 voluntarios
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
      .slice(0, 10);

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
