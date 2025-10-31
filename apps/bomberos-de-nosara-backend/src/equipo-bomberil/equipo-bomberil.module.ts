import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EquipoBomberilService } from './equipo-bomberil.service';
import { EquipoBomberilController } from './equipo-bomberil.controller';
import { EquipoBomberilSchedulerService } from './equipo-bomberil-scheduler.service';
import { EquipoBomberil } from './entities/equipo-bomberil.entity';
import { MantenimientoEquipo } from './entities/equipo-mantenimiento.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EquipoBomberil,
      MantenimientoEquipo,
      User, // Necesario para el scheduler (obtener emails de admins)
    ]),
  ],
  controllers: [EquipoBomberilController],
  providers: [
    EquipoBomberilService,
    EquipoBomberilSchedulerService, // Tareas programadas
  ],
  exports: [EquipoBomberilService],
})
export class EquipoBomberilModule {}