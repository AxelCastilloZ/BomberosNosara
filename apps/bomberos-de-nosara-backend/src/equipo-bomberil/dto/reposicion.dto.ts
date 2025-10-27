import { IsString, IsOptional } from 'class-validator';

export class ReposicionDto {
  @IsString()
  motivo!: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
