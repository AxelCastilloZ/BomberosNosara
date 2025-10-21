import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipoBomberil } from './entities/equipo-bomberil.entity';
import { CreateEquipoBomberilDto } from './dto/create-equipo-bomberil.dto';
import { UpdateEquipoBomberilDto } from './dto/update-equipo-bomberil.dto';
import { ReposicionDto } from './dto/reposicion.dto';
import { EstadoActual } from './enums/equipo-bomberil.enums';
import { CreateCatalogoDto } from './dto/create-catalogo.dto';
import { CatalogoEquipo } from './entities/catalogo-equipo.entity';

@Injectable()
export class EquipoBomberilService {
  constructor(
    @InjectRepository(EquipoBomberil)
    private readonly repo: Repository<EquipoBomberil>,

    @InjectRepository(CatalogoEquipo)
    private readonly repoCatalogo: Repository<CatalogoEquipo>
  ) {}
  



async darDeBaja(id: string, cantidad: number) {
  const equipo = await this.findOne(id);

  if (cantidad < 1) {
    throw new Error('La cantidad debe ser mayor o igual a 1');
  }

  if (cantidad > equipo.cantidad) {
    throw new Error('No puedes dar de baja más de lo que hay disponible');
  }

  if (cantidad === equipo.cantidad) {
    equipo.estadoActual = EstadoActual.DADO_DE_BAJA;
    return this.repo.save(equipo);
  }

  
  equipo.cantidad -= cantidad;
  await this.repo.save(equipo);

  
  const equipoBaja = this.repo.create({
    ...equipo,
    id: undefined, 
    cantidad,
    estadoActual: EstadoActual.DADO_DE_BAJA,
  });

  return this.repo.save(equipoBaja);
}

  async create(dto: CreateEquipoBomberilDto) {
    const equipo = this.repo.create(dto);
    return this.repo.save(equipo);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: string) {
    const equipo = await this.repo.findOneBy({ id });
    if (!equipo) throw new NotFoundException('Equipo no encontrado');
    return equipo;
  }

  async update(id: string, dto: UpdateEquipoBomberilDto) {
    const equipo = await this.findOne(id);
    const actualizado = Object.assign(equipo, dto);
    return this.repo.save(actualizado);
  }

  async remove(id: string) {
    const equipo = await this.findOne(id);
    return this.repo.remove(equipo);
  }

  async solicitarReposicion(id: string, dto: ReposicionDto) {
    const equipo = await this.findOne(id);
    equipo.reposicionSolicitada = true;
    equipo.motivoReposicion = dto.motivo;
    equipo.observacionesReposicion = dto.observaciones;
    equipo.estadoActual = EstadoActual.DADO_DE_BAJA;
    return this.repo.save(equipo);
  }



  async findCatalogos() {
  return this.repoCatalogo.find(); // Asumiendo que inyectas este repositorio
}

async createCatalogo(dto: CreateCatalogoDto) {
  const nuevo = this.repoCatalogo.create(dto);
  return this.repoCatalogo.save(nuevo);
}



  async findByCatalogo(catalogoId: string) {
  return this.repo.find({
    where: { catalogoId },
    order: { fechaAdquisicion: 'DESC' },
  });
}
}
