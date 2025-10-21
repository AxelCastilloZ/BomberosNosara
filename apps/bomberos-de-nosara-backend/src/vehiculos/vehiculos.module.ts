import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VehiculosService } from './vehiculos.service';
import { VehiculosController } from './vehiculos.controller';
import { Vehiculo } from './entities/vehiculo.entity';
import { Mantenimiento } from './entities/mantenimiento-vehiculo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehiculo, Mantenimiento]),
  ],
  controllers: [VehiculosController],
  providers: [VehiculosService],
})
export class VehiculosModule {}
