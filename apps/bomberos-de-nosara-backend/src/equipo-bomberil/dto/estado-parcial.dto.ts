import { IsEnum, IsInt, Min } from 'class-validator';
import { EstadoActual } from '../enums/equipo-bomberil.enums';

export class EstadoParcialDto {
  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsEnum(EstadoActual)
  estadoActual!: EstadoActual;
}
