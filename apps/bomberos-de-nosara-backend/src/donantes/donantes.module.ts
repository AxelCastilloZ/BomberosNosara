import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DonantesService } from './donantes.service';
import { DonantesController } from './donantes.controller';
import { Donante } from './entities/donante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Donante])],
  controllers: [DonantesController],
  providers: [DonantesService],
})
export class DonantesModule {}
