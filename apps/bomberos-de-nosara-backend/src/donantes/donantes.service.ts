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


  async findAll(): Promise<Donante[]> {
    return this.donanteRepository.find();
  }

  async findOne(id: string): Promise<Donante> {
    const donante = await this.donanteRepository.findOneBy({ id });
    if (!donante) {
      throw new NotFoundException(`Donante con ID "${id}" no encontrado`);
    }
    return donante;
  }

  async update(id: string, dto: UpdateDonanteDto): Promise<Donante> {
    const donante = await this.findOne(id);
    const actualizado = Object.assign(donante, dto);
    return this.donanteRepository.save(actualizado);
  }

  async remove(id: string): Promise<Donante> {
    const donante = await this.findOne(id);
    await this.donanteRepository.remove(donante);
    return donante;
  }
}
