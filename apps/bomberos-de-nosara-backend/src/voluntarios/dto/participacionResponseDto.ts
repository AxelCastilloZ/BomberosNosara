// dto/participacion-response.dto.ts
import { TipoActividad } from '../entities/participacion.entity';

export class ParticipacionResponseDto {
  id!: number;
  actividad!: TipoActividad;
  fecha!: string; // Formato DD-MM-YYYY
  horaInicio!: string;
  horaFin!: string;
  descripcion!: string;
  ubicacion!: string;
  estado!: 'pendiente' | 'aprobada' | 'rechazada';
  motivoRechazo?: string;
  fechaRegistro!: Date;
  horasRegistradas!: number;
  voluntario!: {
    id: number;
    username: string;
  };
}

export class PaginatedParticipacionesDto {
  data!: ParticipacionResponseDto[];
  total!: number;
  page!: number;
  totalPages!: number;
}

export class EstadisticasVoluntariosDto {
  totalHoras!: number;
  voluntariosActivos!: number;
  promedioHorasPorVoluntario!: number;
  tasaAprobacion!: number;
  topVoluntarios!: Array<{ nombre: string; horas: number }>;
  participacionesPorTipo!: {
    Entrenamiento: number;
    Emergencia: number;
    Simulacros: number;
  };
}
