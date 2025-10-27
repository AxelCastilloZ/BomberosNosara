import { IsEnum } from 'class-validator';
import { EstadoActual } from '../enums/equipo-bomberil.enums';

export class UpdateEstadoActualDto {
  @IsEnum(EstadoActual, { message: 'estadoActual inválido' })
  estadoActual!: EstadoActual; 
}
