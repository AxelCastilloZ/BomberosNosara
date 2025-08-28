import { IsDateString, IsString, IsOptional } from 'class-validator';

export class MantenimientoProgramadoVehiculoDto {
  @IsDateString()
  fechaProximoMantenimiento!: string;

  @IsString()
  tecnico!: string;

  @IsString()
  tipo!: string;

  @IsString()
  prioridad!: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
