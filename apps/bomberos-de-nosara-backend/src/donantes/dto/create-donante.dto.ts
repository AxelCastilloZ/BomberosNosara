import { IsString, IsUrl, MaxLength, IsOptional } from 'class-validator';

export class CreateDonanteDto {
  
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @IsString()
  descripcion!: string;

  @IsOptional()
  logo?: string;

  @IsUrl()
  url!: string;
}
