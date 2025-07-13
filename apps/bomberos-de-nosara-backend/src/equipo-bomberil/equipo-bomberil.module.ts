import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipoBomberil } from './entities/equipo-bomberil.entity';
import { EquipoBomberilService } from './equipo-bomberil.service';
import { EquipoBomberilController } from './equipo-bomberil.controller';
import { CatalogoEquipo } from './entities/catalogo-equipo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EquipoBomberil,CatalogoEquipo])],
  controllers: [EquipoBomberilController],
  providers: [EquipoBomberilService],
})
export class EquipoBomberilModule {}
