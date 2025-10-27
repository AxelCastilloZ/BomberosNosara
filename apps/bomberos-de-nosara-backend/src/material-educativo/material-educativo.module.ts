import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialEducativo } from './entities/material-educativo.entity';
import { MaterialEducativoService } from './material-educativo.service';
import { MaterialEducativoController } from './material-educativo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialEducativo])],
  controllers: [MaterialEducativoController],
  providers: [MaterialEducativoService],
})
export class MaterialEducativoModule {}
