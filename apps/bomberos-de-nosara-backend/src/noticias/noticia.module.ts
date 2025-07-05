import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Noticia } from './entities/noticia.entity';
import { NoticiaService } from './noticia.service';
import { NoticiaController } from './noticia.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Noticia])],
  controllers: [NoticiaController],
  providers: [NoticiaService],
})
export class NoticiaModule {}
