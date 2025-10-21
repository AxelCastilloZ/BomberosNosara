import { IsEnum, IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { EstadoVehiculo, TipoVehiculo } from '../enums/vehiculo-bomberil.enums';

export class CreateVehiculoDto {
  @IsString()
  placa!: string;

  @IsEnum(TipoVehiculo)
  tipo!: TipoVehiculo;

  @IsString()
  estadoInicial!: 'nuevo' | 'usado';

  @IsEnum(EstadoVehiculo)
  estadoActual!: EstadoVehiculo;

  @IsDateString()
  fechaAdquisicion!: string;

  @IsNumber()
  kilometraje!: number;

}