// donantes.controller.ts
import {
  Controller, Get, Post, Body, Param, Delete, Put, Query,
  UseGuards, UploadedFile, UseInterceptors, ParseIntPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

import { DonantesService } from './donantes.service';
import { CreateDonanteDto } from './dto/create-donante.dto';
import { UpdateDonanteDto } from './dto/update-donante.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '../roles/role.enum';

// Asegura la carpeta de subida
const DONANTES_DIR = join(process.cwd(), 'uploads', 'donantes');
if (!existsSync(DONANTES_DIR)) mkdirSync(DONANTES_DIR, { recursive: true });

// Config de Multer para guardar en disco con nombre único
const donantesStorage = diskStorage({
  destination: (_req, _file, cb) => cb(null, DONANTES_DIR),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + extname(file.originalname));
  },
});

@Controller('donantes')
export class DonantesController {
  constructor(private readonly donantesService: DonantesService) {}

  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string
  ) {
    return this.donantesService.findAll(page, limit, search);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPERUSER, RoleEnum.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('logo', { storage: donantesStorage })) // ⬅️ aquí
  create(@Body() dto: CreateDonanteDto, @UploadedFile() file?: Express.Multer.File) {
    return this.donantesService.create(dto, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPERUSER, RoleEnum.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.donantesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPERUSER, RoleEnum.ADMIN)
  @Put(':id')
  @UseInterceptors(FileInterceptor('logo', { storage: donantesStorage })) // ⬅️ y aquí
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDonanteDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.donantesService.update(id, dto, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPERUSER, RoleEnum.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.donantesService.remove(id);
  }
}
