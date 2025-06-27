import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Noticia } from './entities/noticia.entity';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';

@Injectable()
export class NoticiaService {
  constructor(
    @InjectRepository(Noticia)
    private readonly noticiaRepository: Repository<Noticia>,
  ) {}

  async create(dto: CreateNoticiaDto): Promise<Noticia> {
    const noticia = this.noticiaRepository.create(dto);
    return this.noticiaRepository.save(noticia);
  }

  async findAll(): Promise<Noticia[]> {
    return this.noticiaRepository.find();
  }

  async findOne(id: string): Promise<Noticia> {
    const noticia = await this.noticiaRepository.findOneBy({ id });
    if (!noticia)
      throw new NotFoundException(`Noticia with ID ${id} not found`);
    return noticia;
  }

  async update(id: string, dto: UpdateNoticiaDto): Promise<Noticia> {
    await this.noticiaRepository.update(id, dto);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.noticiaRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Noticia with ID ${id} not found`);
  }
}
