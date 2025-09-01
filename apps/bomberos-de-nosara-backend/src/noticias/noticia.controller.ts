import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { NoticiaService } from './noticia.service';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Controller('noticias')
export class NoticiaController {
  constructor(private readonly noticiaService: NoticiaService) {}

  @Post()
  create(@Body() dto: CreateNoticiaDto) {
    return this.noticiaService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.noticiaService.findAll(
      query.page,
      query.limit,
      query.search,
      query.fechaDesde,
      query.fechaHasta,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.noticiaService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateNoticiaDto) {
    console.log(dto);
    console.log(id);
    return this.noticiaService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.noticiaService.delete(id);
  }
}
