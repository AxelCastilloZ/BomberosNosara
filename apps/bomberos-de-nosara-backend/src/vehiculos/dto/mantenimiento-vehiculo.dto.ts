import { IsDateString, IsNumber, IsString, IsOptional } from 'class-validator';

export class MantenimientoVehiculoDto {
  @IsDateString()
  fecha!: string;

  @IsString()
  descripcion!: string;

  @IsNumber()
  kilometraje!: number;

  @IsString()
  tecnico!: string;

  @IsNumber()
  costo!: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
