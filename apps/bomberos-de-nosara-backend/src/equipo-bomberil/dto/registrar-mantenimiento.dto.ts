


import { IsDateString, IsNumber, IsString, IsOptional, Min, Max, MinLength, IsEnum } from 'class-validator';
import { TipoMantenimiento } from '../enums/mantenimiento.enums';

/**
 * DTO para registrar un mantenimiento que ya ocurrió
 * Crea un mantenimiento directamente con estado COMPLETADO
 * Se usa cuando el mantenimiento NO se programó previamente
 */
export class RegistrarMantenimientoDto {
  @IsEnum(TipoMantenimiento, { message: 'El tipo de mantenimiento debe ser preventivo o correctivo' })
  tipo!: TipoMantenimiento;

  @IsDateString({}, { message: 'La fecha del mantenimiento no es válida' })
  fecha!: string;

  @IsString({ message: 'La descripción debe ser texto válido' })
  @MinLength(5, { message: 'La descripción debe tener al menos 5 caracteres' })
  descripcion!: string;

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