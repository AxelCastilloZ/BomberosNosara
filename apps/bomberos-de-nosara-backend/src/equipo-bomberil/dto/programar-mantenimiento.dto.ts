import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Prioridad, TipoMantenimiento } from '../entities/mantenimiento-programado.entity';

export class ProgramarMantenimientoDto {
  @IsDateString()
  fechaProximoMantenimiento!: string;

  @IsString()
  @MaxLength(150)
  tecnico!: string;

  @IsEnum(TipoMantenimiento)
  tipo!: TipoMantenimiento;

  @IsEnum(Prioridad)
  prioridad!: Prioridad;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
