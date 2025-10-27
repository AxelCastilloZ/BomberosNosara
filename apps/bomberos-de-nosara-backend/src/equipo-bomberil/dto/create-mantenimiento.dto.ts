import { IsDateString, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateMantenimientoDto {
  @IsDateString()
  fecha!: string;

  @IsString()
  @MaxLength(300)
  descripcion!: string;

  @IsString()
  @MaxLength(150)
  tecnico!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costo?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
