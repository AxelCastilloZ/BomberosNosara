import { IsEnum, IsOptional, IsString, IsDateString, IsUUID, IsInt, Min } from 'class-validator';
import { EstadoActual, EstadoInicial } from '../enums/equipo-bomberil.enums';

export class CreateEquipoBomberilDto {
  @IsUUID()
  catalogoId!: string;

  @IsDateString()
  fechaAdquisicion!: string;

  @IsEnum(EstadoInicial)
  estadoInicial!: EstadoInicial;

 
  @IsEnum(EstadoActual)
  estadoActual!: EstadoActual;

  @IsOptional() @IsString()
  numeroSerie?: string;

  @IsOptional() @IsString()
  fotoUrl?: string;

  @IsInt() @Min(1)
  cantidad!: number;
}
