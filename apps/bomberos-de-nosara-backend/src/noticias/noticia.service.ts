import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Noticia } from './entities/noticia.entity';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class NoticiaService {
  [x: string]: any;
  private readonly logger=new Logger(NoticiaService.name);
  private readonly uploadService=new UploadService();

  constructor(
    @InjectRepository(Noticia)
    private readonly noticiaRepository: Repository<Noticia>,
  ) { }

  async create(dto: CreateNoticiaDto): Promise<Noticia> {
    if (dto.fecha) this.validarFechaNoFutura(dto.fecha);
    const noticia=this.noticiaRepository.create(dto);
    return this.noticiaRepository.save(noticia);
  }

  async findAll(
    page=1,
    limit=10,
  ): Promise<{ data: Noticia[]; total: number; page: number; limit: number }> {
    const [data, total]=await this.noticiaRepository.findAndCount({
      order: { fecha: 'DESC' },
      skip: (page-1)*limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Noticia> {
    const noticia=await this.noticiaRepository.findOneBy({ id });
    if (!noticia)
      throw new NotFoundException(`Noticia with ID ${id} not found`);
    return noticia;
  }

  async update(id: string, dto: UpdateNoticiaDto): Promise<Noticia> {
    if (dto.fecha) this.validarFechaNoFutura(dto.fecha);
    await this.noticiaRepository.update(id, dto);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Intentando eliminar noticia con id: ${id}`);
    const noticia=await this.findOne(id);
    if (noticia.url) {
      const filename=noticia.url.replace(
        `http://localhost:3000/uploads/`,
        '',
      );
      const isDeleted=await this.uploadService.deleteFile(filename);
      if (!isDeleted) {
        throw new BadRequestException('Error al eliminar la imagen');
      }
    }
    const result=await this.noticiaRepository.delete(id);
    if (result.affected===0)
      throw new NotFoundException(`Noticia with ID ${id} not found`);
  }

  private validarFechaNoFutura(fecha: string) {
    // fecha viene en formato 'YYYY-MM-DD'
    const today=new Date();
    // Obtener la fecha local en formato YYYY-MM-DD
    const todayStr=today.toLocaleDateString('en-CA'); // 'en-CA' da formato 'YYYY-MM-DD'
    if (fecha>todayStr) {
      throw new BadRequestException('La fecha no puede ser futura.');
    }
  }
}
