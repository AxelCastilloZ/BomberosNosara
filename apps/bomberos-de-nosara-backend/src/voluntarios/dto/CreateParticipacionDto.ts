// dto/create-participacion.dto.ts
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsDateString,
  Matches,
  IsOptional,
} from 'class-validator';
import { TipoActividad } from '../entities/participacion.entity';

export class CreateParticipacionDto {
  @IsEnum(TipoActividad)
  actividad!: TipoActividad;

  @IsDateString()
  fecha!: string;

  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Formato de hora inválido (HH:mm)',
  })
  horaInicio!: string;

  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Formato de hora inválido (HH:mm)',
  })
  horaFin!: string;

  @IsNotEmpty()
  @IsString()
  descripcion!: string;

  @IsNotEmpty()
  @IsString()
  ubicacion!: string;

  @IsOptional()
  @IsString()
  motivoRechazo?: string;
}
