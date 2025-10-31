import { EquipoBomberil } from '../entities/equipo-bomberil.entity';

export class PaginatedEquipoResponseDto {
  data: EquipoBomberil[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}