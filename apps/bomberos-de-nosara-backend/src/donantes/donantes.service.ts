import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donante } from './entities/donante.entity';
import { CreateDonanteDto } from './dto/create-donante.dto';
import { UpdateDonanteDto } from './dto/update-donante.dto';

@Injectable()
export class DonantesService {
  constructor(
    @InjectRepository(Donante)
    private readonly donanteRepository: Repository<Donante>,
  ) {}

  async create(dto: CreateDonanteDto, file?: Express.Multer.File): Promise<Donante> {
    const nuevo = this.donanteRepository.create(dto);
    if (file) {
      nuevo.logo = `/uploads/donantes/${file.filename}`;
    }
    return this.donanteRepository.save(nuevo);
  }

  async findAll(page = 1, limit = 10): Promise<{ data: Donante[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.donanteRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      order: { id: 'DESC' }
    });
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Donante> {
    const donante = await this.donanteRepository.findOneBy({ id });
    if (!donante) {
      throw new NotFoundException(`Donante con ID "${id}" no encontrado`);
    }
    return donante;
  }

  async update(
    id: number,
    dto: UpdateDonanteDto,
    file?: Express.Multer.File, // ← archivo opcional
  ): Promise<Donante> {
    const donante = await this.findOne(id);

    // si llega archivo, actualiza el logo
    if (file) {
      donante.logo = `/uploads/donantes/${file.filename}`;
    }

    Object.assign(donante, dto);
    return this.donanteRepository.save(donante);
  }

  async remove(id: number): Promise<Donante> {
    const donante = await this.findOne(id);
    await this.donanteRepository.remove(donante);
    return donante;
  }
}
