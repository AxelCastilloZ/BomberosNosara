import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donante } from './entities/donante.entity';
import { CreateDonanteDto } from './dto/create-donante.dto';
import { UpdateDonanteDto } from './dto/update-donante.dto';

@Injectable()
export class DonantesService {
  private readonly logger = new Logger(DonantesService.name);
  constructor(
    @InjectRepository(Donante)
    private readonly donanteRepository: Repository<Donante>,
  ) { }

  async create(dto: CreateDonanteDto, file?: Express.Multer.File): Promise<Donante> {
    const nuevo=this.donanteRepository.create(dto);
    if (file) {
      nuevo.logo=`/uploads/donantes/${file.filename}`;
    }
    return this.donanteRepository.save(nuevo);
  }

  async findAll(page=1, limit=10, search=''): Promise<{ data: Donante[]; total: number; page: number; limit: number }> {
    const startTime = Date.now();
    this.logger.debug(`Starting findAll with page=${page}, limit=${limit}, search='${search}'`);
    
    try {
      const query = this.donanteRepository.createQueryBuilder('donante');

      if (search) {
        const searchTerm = `%${search}%`;
        query.where(
          '(LOWER(donante.nombre) LIKE LOWER(:search) OR LOWER(donante.descripcion) LIKE LOWER(:search))',
          { search: searchTerm }
        );
        this.logger.debug(`Searching donantes with term: "${search}"`);
      } else {
        this.logger.debug('Fetching all donantes');
      }

      const [data, total] = await query
        .take(limit)
        .skip((page - 1) * limit)
        .orderBy('donante.id', 'DESC')
        .getManyAndCount()
        .catch(error => {
          this.logger.error('Error in getManyAndCount:', error);
          throw error;
        });

      const executionTime = Date.now() - startTime;
      this.logger.log(`Fetched ${data.length} of ${total} donantes in ${executionTime}ms`);

      return { 
        data, 
        total: Number(total), 
        page: Number(page), 
        limit: Number(limit) 
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
      this.logger.error(`Error in findAll: ${errorMessage}`, errorStack);
      throw new Error('Error al buscar donantes. Por favor, intente nuevamente.');
    }
  }

  async findOne(id: number): Promise<Donante> {
    const donante=await this.donanteRepository.findOneBy({ id });
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
    const donante=await this.findOne(id);

    // si llega archivo, actualiza el logo
    if (file) {
      donante.logo=`/uploads/donantes/${file.filename}`;
    }

    Object.assign(donante, dto);
    return this.donanteRepository.save(donante);
  }

  async remove(id: number): Promise<Donante> {
    const donante=await this.findOne(id);
    await this.donanteRepository.remove(donante);
    return donante;
  }
}
