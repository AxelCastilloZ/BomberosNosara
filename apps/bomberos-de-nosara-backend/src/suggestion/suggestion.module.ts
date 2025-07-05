import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sugerencia } from './suggestion.entity';
import { SugerenciaService } from './suggestion.service';
import { SugerenciaController } from './suggestion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sugerencia])],
  providers: [SugerenciaService],
  controllers: [SugerenciaController],
})
export class SugerenciaModule {}