import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Noticia } from './entities/noticia.entity';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class NoticiaService {
  [x: string]: any;
  private readonly logger = new Logger(NoticiaService.name);
  private readonly uploadService = new UploadService();

  constructor(
    @InjectRepository(Noticia)
    private readonly noticiaRepository: Repository<Noticia>,
  ) {}

  async create(dto: CreateNoticiaDto): Promise<Noticia> {
    const noticia = this.noticiaRepository.create(dto);
    return this.noticiaRepository.save(noticia);
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    fechaDesde?: string,
    fechaHasta?: string,
  ): Promise<{ data: Noticia[]; total: number; page: number; limit: number }> {
    const query = this.noticiaRepository.createQueryBuilder('noticia');

    // Filtrar eliminadas (soft delete)
    query.where('noticia.deletedAt IS NULL');

    if (search) {
      query.andWhere(
        '(noticia.titulo LIKE :search OR noticia.descripcion LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (fechaDesde) {
      query.andWhere('noticia.fecha >= :fechaDesde', { fechaDesde });
    }

    if (fechaHasta) {
      query.andWhere('noticia.fecha <= :fechaHasta', { fechaHasta });
    }

    const [data, total] = await query
      .orderBy('noticia.fecha', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Noticia> {
    const noticia = await this.noticiaRepository.findOneBy({ id });
    if (!noticia)
      throw new NotFoundException(`Noticia with ID ${id} not found`);
    return noticia;
  }

  async update(id: number, dto: UpdateNoticiaDto): Promise<Noticia> {
    await this.noticiaRepository.update(id, dto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    this.logger.log(`Intentando eliminar noticia con id: ${id}`);
    const noticia = await this.findOne(id);

    // Intentar eliminar la imagen asociada si existe
    if (noticia.url) {
      try {
        // Extraer el nombre del archivo de la URL (funciona con cualquier dominio)
        const filename = noticia.url.split('/uploads/').pop() || '';
        const isDeleted = await this.uploadService.deleteFile(filename);
        if (isDeleted) {
          this.logger.log(`Imagen ${filename} eliminada exitosamente`);
        } else {
          this.logger.warn(
            `La imagen ${filename} no existe o ya fue eliminada previamente`,
          );
        }
      } catch (error) {
        // Si hay error al eliminar la imagen, solo registrarlo pero continuar
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`No se pudo eliminar la imagen: ${message}`);
      }
    }

    // Eliminar la noticia (soft delete) independientemente del estado de la imagen
    const result = await this.noticiaRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Noticia with ID ${id} not found`);
    }

    this.logger.log(
      `Noticia con id: ${id} eliminada exitosamente (soft delete)`,
    );
  }

  // Método para auditoría - ver noticias eliminadas
  async findAllDeleted(): Promise<Noticia[]> {
    return this.noticiaRepository
      .find({
        where: {},
        withDeleted: true,
        order: { deletedAt: 'DESC' },
      })
      .then((all) => all.filter((n) => n.deletedAt !== null));
  }
}
