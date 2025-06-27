import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sugerencia } from './suggestion.entity';
import { CreateSugerenciaDto } from './dto/create-suggestion.dto';
import { UpdateSugerenciaDto } from './dto/update-suggestion.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SugerenciaService {
    constructor(
        @InjectRepository(Sugerencia)
        private readonly repo: Repository<Sugerencia>,
    ) { }

    async findAll(): Promise<Sugerencia[]> {
        return this.repo.find({
            order: {
                id: 'DESC'
            }
        });
    }


    async findOne(id: number): Promise<Sugerencia> {
        const sugerencia = await this.repo.findOneBy({ id });
        if (!sugerencia) throw new NotFoundException('Sugerencia no encontrada');
        return sugerencia;
    }

    async create(dto: CreateSugerenciaDto): Promise<Sugerencia> {
        const sugerencia = this.repo.create(dto); 
        return this.repo.save(sugerencia);
    }

    async update(id: number, dto: UpdateSugerenciaDto): Promise<Sugerencia> {
        const sugerencia = await this.findOne(id);
        Object.assign(sugerencia, dto);
        return this.repo.save(sugerencia);
    }

    async remove(id: number): Promise<void> {
        const sugerencia = await this.findOne(id);
        await this.repo.remove(sugerencia);
    }
}