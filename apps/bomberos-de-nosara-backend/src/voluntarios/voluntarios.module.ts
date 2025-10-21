import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VoluntariosService } from './voluntarios.service';
import { VoluntariosController } from './voluntarios.controller';

import { Participacion } from './entities/participacion.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Participacion, User])],
  controllers: [VoluntariosController],
  providers: [VoluntariosService],
})
export class VoluntariosModule {}
