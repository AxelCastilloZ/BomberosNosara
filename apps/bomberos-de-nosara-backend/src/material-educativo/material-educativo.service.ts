import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MaterialEducativo } from './entities/material-educativo.entity';
import { Repository } from 'typeorm';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { existsSync, unlinkSync } from 'fs';
import { join, extname } from 'path';

@Injectable()
export class MaterialEducativoService {
  constructor(
    @InjectRepository(MaterialEducativo)
    private readonly repo: Repository<MaterialEducativo>,
  ) {}

  async findAll(
    page = 1,
    limit = 10,
    search = '',
    filter = '',
  ): Promise<{ data: MaterialEducativo[]; total: number }> {
    const qb = this.repo.createQueryBuilder('m');

    if (search) {
      qb.andWhere(
        '(LOWER(m.titulo) LIKE :term OR LOWER(m.descripcion) LIKE :term)',
        { term: `%${search.toLowerCase()}%` },
      );
    }

    if (filter) {
      qb.andWhere('m.tipo = :filter', { filter });
    }

    const [data, total] = await qb
      .orderBy('m.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOneOrFail(id: number): Promise<MaterialEducativo> {
    const mat = await this.repo.findOne({ where: { id } });
    if (!mat) throw new NotFoundException(`Material #${id} no encontrado`);
    return mat;
  }

  async create(
    data: CreateMaterialDto,
    archivoUrl: string,
    vistaPreviaUrl?: string,
  ) {
    const material = this.repo.create({
      ...data,
      url: archivoUrl,
      vistaPrevia: vistaPreviaUrl,
    });
    return await this.repo.save(material);
  }

  async update(id: number, data: UpdateMaterialDto, archivoUrl?: string) {
    const material = await this.findOneOrFail(id);

    if (data.titulo !== undefined) material.titulo = data.titulo;
    if (data.descripcion !== undefined) material.descripcion = data.descripcion;
    if (data.tipo !== undefined) material.tipo = data.tipo;

    if (archivoUrl) {
      const ext = extname(archivoUrl).replace('.', '').toLowerCase();
      const allowed = this.allowedByTipo(material.tipo);
      if (allowed.length && !allowed.includes(ext)) {
        this.safeRemoveByUrl(archivoUrl);
        throw new BadRequestException(
          `El archivo .${ext} no es válido para el tipo "${material.tipo}". Permitidos: ${allowed.join(
            ', ',
          )}`,
        );
      }
      if (material.url) this.safeRemoveByUrl(material.url);
      material.url = archivoUrl;
    }

    return await this.repo.save(material);
  }

  async remove(id: number) {
    const material = await this.findOneOrFail(id);
    if (material.url) this.safeRemoveByUrl(material.url);
    await this.repo.remove(material);
    return { message: 'Material eliminado correctamente' };
  }

  private allowedByTipo(tipo?: string): string[] {
    const t = (tipo || '').toUpperCase();
    const map: Record<string, string[]> = {
      PDF: ['pdf'],
      VIDEO: ['mp4', 'avi', 'mov'],
      DOCUMENTO: ['doc', 'docx', 'txt'],
      IMAGEN: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    };
    return map[t] || [];
  }

  private safeRemoveByUrl(url: string) {
    const rel = url.replace(/^\//, '');
    const full = join(process.cwd(), rel);
    if (existsSync(full)) {
      try {
        unlinkSync(full);
      } catch {
        // no interrumpe si falla el borrado
      }
    }
  }
}
