import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Put,
  Param,
  ParseIntPipe,
  Delete,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Response } from 'express';

import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialEducativoService } from './material-educativo.service';

function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

const MATERIAL_DIR = join(process.cwd(), 'uploads', 'material');

@Controller('material-educativo')
export class MaterialEducativoController {
  constructor(private readonly service: MaterialEducativoService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureDir(MATERIAL_DIR);
          cb(null, MATERIAL_DIR);
        },
        filename: (_req, file, cb) => {
          const uniqueName = Date.now() + extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
      // limits: { fileSize: 25 * 1024 * 1024 }, // opcional
    }),
  )
  async create(@UploadedFile() archivo: Express.Multer.File, @Body() data: CreateMaterialDto) {
    const archivoUrl = `/uploads/material/${archivo.filename}`;
    return this.service.create(data, archivoUrl);
  }

  /** EDITAR: acepta JSON (solo metadatos) o multipart (metadatos + archivo) */
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureDir(MATERIAL_DIR);
          cb(null, MATERIAL_DIR);
        },
        filename: (_req, file, cb) => {
          const uniqueName = Date.now() + extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() archivo: Express.Multer.File,
    @Body() data: UpdateMaterialDto,
  ) {
    const archivoUrl = archivo ? `/uploads/material/${archivo.filename}` : undefined;
    return this.service.update(id, data, archivoUrl);
  }

  /** DESCARGA: fuerza descarga con Content-Disposition y respeta token (si usas guard) */
  @Get(':id/download')
  async download(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const mat = await this.service.findOneOrFail(id);

    // mat.url => "/uploads/material/archivo.ext"
    const relPath = mat.url.replace(/^\//, ''); // "uploads/material/archivo.ext"
    const full = join(process.cwd(), relPath);
    if (!existsSync(full)) {
      return res.status(404).send('Archivo no encontrado');
    }

    // nombre amigable basado en título + extensión original
    const ext = extname(full) || '.bin';
    const safeBase = (mat.titulo || 'material')
      .normalize('NFKD')
      .replace(/[^\w\s.-]+/g, '')
      .trim()
      .replace(/\s+/g, '_');
    const filename = `${safeBase}${ext}`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.sendFile(full);
  }

  /** ELIMINAR: borra registro y archivo físico */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
