import { IsOptional, IsString, IsNumber, IsEnum, IsUrl, IsDateString, MinLength, Max, Min, ValidateIf } from 'class-validator';
import { EstadoVehiculo, TipoVehiculo } from '../enums/vehiculo-bomberil.enums';

export class EditVehiculoDto {
  
  @IsOptional()
  @IsNumber({}, { message: 'El kilometraje debe ser un número válido' })
  @Min(0, { message: 'El kilometraje no puede ser negativo' })
  @Max(9999999, { message: 'El kilometraje es demasiado alto' })
  kilometraje?: number;

  @IsOptional()
  @IsEnum(EstadoVehiculo, { message: 'Estado de vehículo no válido' })
  estadoActual?: EstadoVehiculo;

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto válido' })
  observaciones?: string;

  @IsOptional()
  @IsUrl({}, { message: 'La URL de la foto no es válida' })
  fotoUrl?: string;

 
  @IsOptional()
  @IsString({ message: 'La placa debe ser texto válido' })
  @MinLength(1, { message: 'La placa no puede estar vacía' })
  placa?: string;

  @IsOptional()
  @IsEnum(TipoVehiculo, { message: 'Tipo de vehículo no válido' })
  tipo?: TipoVehiculo;

  @IsOptional()
  @IsDateString({}, { message: 'Fecha de adquisición no válida' })
  fechaAdquisicion?: string;

  
  @ValidateIf(o => o.estadoActual === EstadoVehiculo.MALO)
  @IsString({ message: 'Las observaciones son obligatorias cuando el estado es MALO' })
  @MinLength(10, { message: 'Describe el problema del vehículo (mínimo 10 caracteres)' })
  observacionesProblema?: string;

  @ValidateIf(o => o.estadoActual === EstadoVehiculo.BAJA)
  @IsString({ message: 'El motivo es obligatorio para dar de baja un vehículo' })
  @MinLength(5, { message: 'Especifica el motivo de la baja (mínimo 5 caracteres)' })
  motivoBaja?: string;
}