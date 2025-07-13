import { IsString, IsEnum } from 'class-validator';

export class CreateCatalogoDto {
  @IsString()
  nombre!: string;

  @IsEnum(['terrestre', 'marítimo'], {
    message: 'tipo debe ser "terrestre" o "marítimo"',
  })
  tipo!: 'terrestre' | 'marítimo';
}
