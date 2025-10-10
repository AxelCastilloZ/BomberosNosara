import { Vehiculo } from '../entities/vehiculo.entity';

export class PaginatedVehiculoResponseDto {
  data: Vehiculo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}