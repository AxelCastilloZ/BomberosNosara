import { IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateDonanteDto {
  @IsString()
  @MaxLength(50)
  id!: string;

  @IsString()
  @MaxLength(100)
  nombre!: string;

  @IsString()
  descripcion!: string;

  @IsUrl()
  logo!: string;

  @IsUrl()
  url!: string;
}
