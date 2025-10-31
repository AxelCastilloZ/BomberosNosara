// material-educativo.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialEducativo } from './entities/material-educativo.entity';
import { MaterialEducativoService } from './material-educativo.service';
import { MaterialEducativoController } from './material-educativo.controller';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialEducativo, User])],
  controllers: [MaterialEducativoController],
  providers: [MaterialEducativoService],
})
export class MaterialEducativoModule {}
