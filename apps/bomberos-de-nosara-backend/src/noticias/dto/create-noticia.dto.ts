import { IsString, IsUrl, IsDate } from 'class-validator';

export class CreateNoticiaDto {
  @IsString()
  id: string;

  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsUrl()
  url: string;

  @IsString()
  fecha: string;
}
