import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateSugerenciaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  telefono: string;

  @IsString()
  @IsNotEmpty()
  contenido: string;
}