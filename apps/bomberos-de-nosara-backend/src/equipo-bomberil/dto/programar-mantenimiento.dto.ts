


import { IsDateString, IsString, IsOptional, MinLength, IsEnum } from 'class-validator';
import { TipoMantenimiento } from '../enums/mantenimiento.enums';

/**
 * DTO para programar un mantenimiento
 * Crea un mantenimiento con estado PENDIENTE
 * Los campos de costo, técnico se llenan al completar
 */
export class ProgramarMantenimientoDto {
  @IsEnum(TipoMantenimiento, { message: 'El tipo de mantenimiento debe ser preventivo o correctivo' })
  tipo!: TipoMantenimiento;

  @IsDateString({}, { message: 'La fecha del mantenimiento no es válida' })
  fecha!: string;

  @IsString({ message: 'La descripción debe ser texto válido' })
  @MinLength(5, { message: 'La descripción debe tener al menos 5 caracteres' })
  descripcion!: string;

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto válido' })
  observaciones?: string;
}




