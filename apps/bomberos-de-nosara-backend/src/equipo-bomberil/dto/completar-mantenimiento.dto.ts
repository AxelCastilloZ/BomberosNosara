

import { IsNumber, IsString, IsOptional, Min, Max, MinLength } from 'class-validator';

/**
 * DTO para completar un mantenimiento
 * Se usa cuando el mantenimiento está EN_REVISION o PENDIENTE
 * y se quiere pasar a COMPLETADO con todos los datos
 */
export class CompletarMantenimientoDto {
  @IsString({ message: 'El técnico debe ser texto válido' })
  @MinLength(3, { message: 'El nombre del técnico debe tener al menos 3 caracteres' })
  tecnico!: string;

  @IsNumber({}, { message: 'El costo debe ser un número válido' })
  @Min(0, { message: 'El costo no puede ser negativo' })
  @Max(99999999.99, { message: 'El costo es demasiado alto' })
  costo!: number;

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto válido' })
  observaciones?: string;
}