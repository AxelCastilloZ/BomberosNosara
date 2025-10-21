import { IsOptional, IsString, IsNumber, IsEnum, IsDateString, MinLength, Max, Min, IsIn } from 'class-validator';
import { EstadoVehiculo, TipoVehiculo } from '../enums/vehiculo-bomberil.enums';

export class EditVehiculoDto {
  
  @IsOptional()
  @IsString({ message: 'La placa debe ser texto válido' })
  @MinLength(1, { message: 'La placa no puede estar vacía' })
  placa?: string;

  @IsOptional()
  @IsEnum(TipoVehiculo, { message: 'Tipo de vehículo no válido' })
  tipo?: TipoVehiculo;

  @IsOptional()
  @IsIn(['nuevo', 'usado'], { message: 'Estado inicial no válido' })  // ✅ AGREGAR
  estadoInicial?: 'nuevo' | 'usado';

  @IsOptional()
  @IsDateString({}, { message: 'Fecha de adquisición no válida' })
  fechaAdquisicion?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El kilometraje debe ser un número válido' })
  @Min(0, { message: 'El kilometraje no puede ser negativo' })
  @Max(9999999, { message: 'El kilometraje es demasiado alto' })
  kilometraje?: number;

  // ❌ QUITAR observaciones - es un log automático del sistema
  // ❌ QUITAR estadoActual - se cambia solo desde CambiarEstadoModal con updateEstado()
}