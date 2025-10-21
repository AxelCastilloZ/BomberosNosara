import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialEducativo } from './entities/material-educativo.entity';
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

  // ✅ Asegurar que siempre incluya la relación createdByUser
  async findAll(page = 1, limit = 10, titulo = '', tipo = '', area = '') {
    const qb = this.repo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.createdByUser', 'createdByUser')
      .where('m.deletedAt IS NULL'); // Excluir eliminados

    if (titulo)
      qb.andWhere('LOWER(m.titulo) LIKE :titulo', {
        titulo: `%${titulo.toLowerCase()}%`,
      });
    if (tipo) qb.andWhere('m.tipo = :tipo', { tipo });
    if (area) qb.andWhere('m.area = :area', { area });

    const [data, total] = await qb
      .orderBy('m.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  // ✅ Buscar uno incluyendo la relación
  async findOneOrFail(id: number) {
    const mat = await this.repo.findOne({
      where: { id },
      relations: ['createdByUser'], // Usar array de strings
    });
    if (!mat) throw new NotFoundException(`Material #${id} no encontrado`);
    return mat;
  }

  // ✅ Crear con usuario (auditoría)
  async create(
    data: CreateMaterialDto,
    archivoUrl: string,
    userId: number,
    vistaPreviaUrl?: string,
  ) {
    const material = this.repo.create({
      ...data,
      url: archivoUrl,
      vistaPrevia: vistaPreviaUrl,
      createdBy: userId,
      updatedBy: userId,
    });
    
    const saved = await this.repo.save(material);
    
    // Recargar con la relación para retornar el objeto completo
    return this.findOneOrFail(saved.id);
  }

  // ✅ Actualizar con auditoría
  async update(
    id: number,
    data: UpdateMaterialDto,
    archivoUrl?: string,
    userId?: number,
  ) {
    const material = await this.findOneOrFail(id);

    if (data.titulo !== undefined) material.titulo = data.titulo;
    if (data.descripcion !== undefined) material.descripcion = data.descripcion;
    if (data.tipo !== undefined) material.tipo = data.tipo;
    if (data.area !== undefined) material.area = data.area;

    if (archivoUrl) {
      const ext = extname(archivoUrl).replace('.', '').toLowerCase();
      const allowed = this.allowedByTipo(material.tipo);
      if (allowed.length && !allowed.includes(ext)) {
        this.safeRemoveByUrl(archivoUrl);
        throw new BadRequestException(
          `El archivo .${ext} no es válido para el tipo "${material.tipo}". Permitidos: ${allowed.join(', ')}`,
        );
      }
      if (material.url) this.safeRemoveByUrl(material.url);
      material.url = archivoUrl;
    }

    if (userId) material.updatedBy = userId;

    await this.repo.save(material);
    
    // Recargar con la relación actualizada
    return this.findOneOrFail(id);
  }

  // ✅ Soft delete con auditoría
  async softDelete(id: number, userId: number) {
    const material = await this.findOneOrFail(id);
    material.deletedBy = userId;
    await this.repo.save(material);
    await this.repo.softDelete(id);
    return { message: 'Material eliminado correctamente' };
  }

  // ✅ Restaurar material eliminado
  async restore(id: number, userId: number) {
    const mat = await this.repo.findOne({ 
      where: { id }, 
      withDeleted: true,
      relations: ['createdByUser']
    });
    if (!mat) throw new NotFoundException('Material no encontrado');
    await this.repo.restore(id);
    mat.deletedBy = null;
    mat.updatedBy = userId;
    await this.repo.save(mat);
    
    // Recargar con la relación actualizada
    return this.findOneOrFail(id);
  }

  // ==================== UTILIDADES ====================

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