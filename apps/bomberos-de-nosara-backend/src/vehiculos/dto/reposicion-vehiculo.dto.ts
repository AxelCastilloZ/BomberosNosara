import { IsString, IsOptional } from 'class-validator';

export class ReposicionVehiculoDto {
  @IsString()
  motivo!: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
