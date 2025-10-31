

import { IsOptional, IsString, IsDateString, IsNumber, Min } from 'class-validator';

export class EditMantenimientoDto {
  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsString()
  tecnico?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costo?: number;
}