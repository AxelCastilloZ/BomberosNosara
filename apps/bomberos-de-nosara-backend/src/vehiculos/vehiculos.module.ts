import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VehiculosService } from './vehiculos.service';
import { VehiculosController } from './vehiculos.controller';
import { Vehiculo } from './entities/vehiculo.entity';
import { Mantenimiento } from './entities/mantenimiento-vehiculo.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
  TypeOrmModule.forFeature([Vehiculo, Mantenimiento, User]), // Agregar User
],
  controllers: [VehiculosController],
  providers: [VehiculosService],
})
export class VehiculosModule {}
