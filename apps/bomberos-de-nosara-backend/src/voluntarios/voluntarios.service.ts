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
import { Repository } from 'typeorm';
import { Participacion } from './entities/participacion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateParticipacionDto } from './dto/CreateParticipacionDto';
import { ActualizarEstadoDto } from './dto/ActualizarEstadoDto';

@Injectable()
export class VoluntariosService {
  constructor(
    @InjectRepository(Participacion)
    private readonly participacionRepo: Repository<Participacion>,
  ) {}

  private verificarRolVoluntario(user: any): boolean {
    return user.roles?.includes(RoleEnum.VOLUNTARIO);
  }

  private calcularHoras(horaInicio: string, horaFin: string): number {
    const [hi, mi] = horaInicio.split(':').map(Number);
    const [hf, mf] = horaFin.split(':').map(Number);

    const inicio = new Date(0, 0, 0, hi, mi);
    const fin = new Date(0, 0, 0, hf, mf);

    const diffMs = fin.getTime() - inicio.getTime();
    return diffMs / (1000 * 60 * 60);
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

  // Service para listar el historial de participaciones de un voluntario
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

  // Service para listar todas las participaciones (admin)
  async listarTodasParticipaciones(estado?: string): Promise<any[]> {
    const where: any = {};
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
}
