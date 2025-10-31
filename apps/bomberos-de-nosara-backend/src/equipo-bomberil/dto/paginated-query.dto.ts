

import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoEquipo, TipoEquipo } from '../enums/equipo-bomberil.enums';

export class PaginatedEquipoQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(EstadoEquipo)
  status?: EstadoEquipo;

  @IsOptional()
  @IsEnum(TipoEquipo)
  type?: TipoEquipo;
}