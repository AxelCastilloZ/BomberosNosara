import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoVehiculo, TipoVehiculo } from '../enums/vehiculo-bomberil.enums';

export class PaginatedVehiculoQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(EstadoVehiculo)
  status?: EstadoVehiculo;

  @IsOptional()
  @IsEnum(TipoVehiculo)
  type?: TipoVehiculo;
}