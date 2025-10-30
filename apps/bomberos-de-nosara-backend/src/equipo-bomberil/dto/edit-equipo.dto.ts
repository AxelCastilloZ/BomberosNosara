

import { IsOptional, IsString, IsEnum, IsDateString, MinLength, MaxLength, IsIn } from 'class-validator';
import { EstadoEquipo, TipoEquipo } from '../enums/equipo-bomberil.enums';

export class EditEquipoDto {
  
  @IsOptional()
  @IsString({ message: 'El número de serie debe ser texto válido' })
  @MinLength(1, { message: 'El número de serie no puede estar vacío' })
  @MaxLength(100, { message: 'El número de serie es demasiado largo' })
  numeroSerie?: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto válido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El nombre es demasiado largo' })
  nombre?: string;

  @IsOptional()
  @IsEnum(TipoEquipo, { message: 'Tipo de equipo no válido' })
  tipo?: TipoEquipo;

  @IsOptional()
  @IsIn(['nuevo', 'usado'], { message: 'Estado inicial no válido' })
  estadoInicial?: 'nuevo' | 'usado';

  @IsOptional()
  @IsDateString({}, { message: 'Fecha de adquisición no válida' })
  fechaAdquisicion?: string;

}