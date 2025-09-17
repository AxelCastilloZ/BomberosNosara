// src/voluntarios/dto/filtros-participacion.dto.ts
import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { TipoActividad } from '../entities/participacion.entity';

export class FiltrosParticipacionDto {
  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  voluntario?: string;

  @IsOptional()
  @IsEnum(TipoActividad)
  tipoActividad?: TipoActividad;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @IsEnum(['aprobada', 'pendiente', 'rechazada'])
  estado?: 'aprobada' | 'pendiente' | 'rechazada';

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 6;
}
