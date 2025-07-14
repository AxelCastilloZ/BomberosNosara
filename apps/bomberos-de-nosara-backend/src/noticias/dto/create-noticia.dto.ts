import { IsString } from 'class-validator';

export class CreateNoticiaDto {
  @IsString()
  id!: string;

  @IsString()
  titulo!: string;

  @IsString()
  descripcion!: string;

  @IsString()
  url!: string;

  @IsString()
  fecha!: string;
}
