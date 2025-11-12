

import { IsEnum, IsString, IsDateString, MinLength, MaxLength } from 'class-validator';
import { EstadoEquipo, TipoEquipo } from '../enums/equipo-bomberil.enums';

export class CreateEquipoDto {
  @IsString({ message: 'El número de serie debe ser texto válido' })
  @MinLength(1, { message: 'El número de serie no puede estar vacío' })
  @MaxLength(100, { message: 'El número de serie es demasiado largo' })
  numeroSerie!: string;

  @IsString({ message: 'El nombre debe ser texto válido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El nombre es demasiado largo' })
  nombre!: string;

  @IsEnum(TipoEquipo, { message: 'Tipo de equipo no válido' })
  tipo!: TipoEquipo;

  @IsString({ message: 'El estado inicial debe ser texto válido' })
  @IsEnum(['nuevo', 'usado'], { message: 'Estado inicial debe ser "nuevo" o "usado"' })
  estadoInicial!: 'nuevo' | 'usado';

  @IsEnum(EstadoEquipo, { message: 'Estado actual no válido' })
  estadoActual!: EstadoEquipo;

  @IsDateString({}, { message: 'Fecha de adquisición no válida' })
  fechaAdquisicion!: string;
}