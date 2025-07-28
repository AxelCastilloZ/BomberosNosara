/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { User } from '../users/entities/user.entity';
import { RoleEnum } from '../roles/role.enum';
import { Repository } from 'typeorm';
import { Participacion } from './entities/participacion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateParticipacionDto } from './dto/CreateParticipacionDto';

@Injectable()
export class VoluntariosService {
  constructor(
    @InjectRepository(Participacion)
    private readonly participacionRepo: Repository<Participacion>,
  ) {}

  private verificarRolVoluntario(user: any): boolean {
    return user.roles?.includes(RoleEnum.VOLUNTARIO);
  }

  async crearParticipacion(
    user: User,
    dto: CreateParticipacionDto,
  ): Promise<Participacion> {
    if (!this.verificarRolVoluntario(user)) {
      throw new UnauthorizedException(
        'Solo usuarios con rol VOLUNTARIO pueden registrar participaciones',
      );
    }

    const participacion = this.participacionRepo.create({
      voluntario: user,
      actividad: dto.actividad,
      fecha: dto.fecha,
      horaInicio: dto.horaInicio,
      horaFin: dto.horaFin,
      descripcion: dto.descripcion,
      ubicacion: dto.ubicacion,
      estado: 'pendiente',
    });

    return await this.participacionRepo.save(participacion);
  }

  async listarHistorial(user: User, estado?: string): Promise<Participacion[]> {
    const where: any = { voluntario: { id: user.id } };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (estado) where.estado = estado;

    return await this.participacionRepo.find({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where,
      order: { fecha: 'DESC' },
    });
  }

  async listarTodasParticipaciones(estado?: string): Promise<Participacion[]> {
    const where: any = {};
    if (estado) where.estado = estado;

    return await this.participacionRepo.find({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where,
      order: { fecha: 'DESC' },
    });
  }
}
