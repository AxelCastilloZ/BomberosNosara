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
  Query,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Response } from 'express';

import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialEducativoService } from './material-educativo.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

const MATERIAL_DIR = join(process.cwd(), 'uploads', 'material');

@Controller('material-educativo')
@UseGuards(JwtAuthGuard)
export class MaterialEducativoController {
  constructor(private readonly service: MaterialEducativoService) {}

  // ✅ Obtener todos con filtros
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('titulo') titulo?: string,
    @Query('tipo') tipo?: string,
    @Query('area') area?: string,
  ) {
    return this.service.findAll(
      Number(page),
      Number(limit),
      titulo ?? '',
      tipo ?? '',
      area ?? '',
    );
  }

  // ✅ Crear material (con archivo)
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
    }),
  )
  async create(
    @UploadedFile() archivo: Express.Multer.File,
    @Body() data: CreateMaterialDto,
    @GetUser('id') userId: number,
  ) {
    const archivoUrl = `/uploads/material/${archivo.filename}`;
    return this.service.create(data, archivoUrl, userId);
  }

  // ✅ Actualizar sin archivo
  @Put(':id')
  async updateJson(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateMaterialDto,
    @GetUser('id') userId: number,
  ) {
    return this.service.update(id, data, undefined, userId);
  }

  // ✅ Actualizar con archivo
  @Put(':id/file')
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
  async updateWithFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() archivo: Express.Multer.File,
    @Body() data: UpdateMaterialDto,
    @GetUser('id') userId: number,
  ) {
    if (typeof data === 'string') data = JSON.parse(data);
    const archivoUrl = archivo ? `/uploads/material/${archivo.filename}` : undefined;
    return this.service.update(id, data, archivoUrl, userId);
  }

  // ✅ Descargar archivo
  @Get(':id/download')
  async download(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const mat = await this.service.findOneOrFail(id);
    const relPath = mat.url.replace(/^\//, '');
    const full = join(process.cwd(), relPath);
    if (!existsSync(full)) return res.status(404).send('Archivo no encontrado');

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

  // ✅ Eliminar
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @GetUser('id') userId: number) {
    return this.service.softDelete(id, userId);
  }

  // ✅ Restaurar
  @Post(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number, @GetUser('id') userId: number) {
    return this.service.restore(id, userId);
  }
}
