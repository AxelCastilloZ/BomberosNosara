// src/equipo-bomberil/equipo-bomberil.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EquipoBomberil } from './entities/equipo-bomberil.entity';
import { CatalogoEquipo } from './entities/catalogo-equipo.entity';
import { EquipoMantenimiento } from './entities/equipo-mantenimiento.entity';
import { MantenimientoProgramado } from './entities/mantenimiento-programado.entity';

import { EquipoBomberilController } from './equipo-bomberil.controller';
import { EquipoBomberilService } from './equipo-bomberil.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EquipoBomberil,
      CatalogoEquipo,
      EquipoMantenimiento,
      MantenimientoProgramado,
    ]),
  ],
  controllers: [EquipoBomberilController],
  providers: [EquipoBomberilService],
  exports: [EquipoBomberilService], // <- opcional
})
export class EquipoBomberilModule {}
