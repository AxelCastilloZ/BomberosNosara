import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EquipoBomberil } from './entities/equipo-bomberil.entity';
import { CatalogoEquipo } from './entities/catalogo-equipo.entity';
import { EquipoMantenimiento } from './entities/equipo-mantenimiento.entity';
import { MantenimientoProgramado } from './entities/mantenimiento-programado.entity';

import { CreateEquipoBomberilDto } from './dto/create-equipo-bomberil.dto';
import { UpdateEquipoBomberilDto } from './dto/update-equipo-bomberil.dto';
import { ReposicionDto } from './dto/reposicion.dto';
import { CreateCatalogoDto } from './dto/create-catalogo.dto';
import { CreateMantenimientoDto } from './dto/create-mantenimiento.dto';
import { ProgramarMantenimientoDto } from './dto/programar-mantenimiento.dto';

import { EstadoActual } from './enums/equipo-bomberil.enums';

@Injectable()
export class EquipoBomberilService {
  constructor(
    @InjectRepository(EquipoBomberil) private readonly repo: Repository<EquipoBomberil>,
    @InjectRepository(CatalogoEquipo) private readonly repoCatalogo: Repository<CatalogoEquipo>,
    @InjectRepository(EquipoMantenimiento) private readonly repoMant: Repository<EquipoMantenimiento>,
    @InjectRepository(MantenimientoProgramado) private readonly repoProg: Repository<MantenimientoProgramado>,
  ) {}

  /* ===================== CRUD Equipo ===================== */
  async create(dto: CreateEquipoBomberilDto) {
    const equipo = this.repo.create(dto);
    return this.repo.save(equipo);
  }

  findAll() {
    return this.repo.find({ relations: { catalogo: true } });
  }

  async findOne(id: string) {
    const equipo = await this.repo.findOne({ where: { id }, relations: { catalogo: true } });
    if (!equipo) throw new NotFoundException('Equipo no encontrado');
    return equipo;
  }

  async update(id: string, dto: UpdateEquipoBomberilDto) {
    const equipo = await this.findOne(id);
    Object.assign(equipo, dto);
    return this.repo.save(equipo);
  }

  async remove(id: string) {
    const equipo = await this.findOne(id);
    return this.repo.remove(equipo);
  }

  /* ================= Reposición / Bajas ================== */
  async solicitarReposicion(id: string, dto: ReposicionDto) {
    const equipo = await this.findOne(id);
    equipo.reposicionSolicitada = true;
    equipo.motivoReposicion = dto.motivo;
    equipo.observacionesReposicion = dto.observaciones;
    equipo.estadoActual = EstadoActual.DADO_DE_BAJA;
    return this.repo.save(equipo);
  }

  async darDeBaja(id: string, cantidad: number) {
    const equipo = await this.findOne(id);
    if (cantidad < 1) throw new Error('La cantidad debe ser mayor o igual a 1');
    if (cantidad > equipo.cantidad) throw new Error('No puedes dar de baja más de lo disponible');

    if (cantidad === equipo.cantidad) {
      equipo.estadoActual = EstadoActual.DADO_DE_BAJA;
      return this.repo.save(equipo);
    }

    equipo.cantidad -= cantidad;
    await this.repo.save(equipo);

    const equipoBaja = this.repo.create({
      ...equipo,
      id: undefined as any,
      cantidad,
      estadoActual: EstadoActual.DADO_DE_BAJA,
    });
    return this.repo.save(equipoBaja);
  }

  /* ======================== Catálogo ====================== */
  findCatalogos() {
    return this.repoCatalogo.find();
  }

  createCatalogo(dto: CreateCatalogoDto) {
    const nuevo = this.repoCatalogo.create(dto);
    return this.repoCatalogo.save(nuevo);
  }

  findByCatalogo(catalogoId: string) {
    return this.repo.find({
      where: { catalogoId },
      order: { fechaAdquisicion: 'DESC' },
      relations: { catalogo: true },
    });
  }

  /* ========== Mantenimiento realizado (historial) ========= */
  async registrarMantenimiento(id: string, dto: CreateMantenimientoDto) {
    await this.findOne(id); // valida existencia

    const entity = this.repoMant.create({
      fecha: dto.fecha,
      descripcion: dto.descripcion,
      tecnico: dto.tecnico,
      // DECIMAL -> string
      costo: dto.costo != null ? String(dto.costo) : undefined,
      observaciones: dto.observaciones,
      equipo: { id } as any, // relación
    });

    return this.repoMant.save(entity);
  }

  async getHistorial(id: string) {
    await this.findOne(id);
    return this.repoMant.find({
      where: { equipo: { id } },
      order: { fecha: 'DESC', createdAt: 'DESC' },
    });
  }

  /* ======= Mantenimiento programado (próximo) ============ */
  async programarMantenimiento(id: string, dto: ProgramarMantenimientoDto) {
    await this.findOne(id);
    const entity = this.repoProg.create({
      ...dto,
      estado: 'pendiente',
      equipo: { id } as any,
    });
    return this.repoProg.save(entity);
  }
}
