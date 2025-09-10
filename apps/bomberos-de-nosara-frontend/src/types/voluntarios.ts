export enum TipoActividad {
  ENTRENAMIENTO = 'Entrenamiento',
  EMERGENCIA = 'Emergencia',
  SIMULACROS = 'Simulacros',
}

export type Participacion = {
  id: number;
  actividad: TipoActividad;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  descripcion: string;
  ubicacion: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  motivoRechazo?: string;
  fechaRegistro: string;
  voluntario: { id: number; username: string };
  horasRegistradas: number;
};

export type CreateParticipacionDto = {
  actividad: TipoActividad;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  descripcion: string;
  ubicacion: string;
};

export type UpdateEstadoDto = {
  estado: 'aprobada' | 'rechazada';
  motivoRechazo?: string;
};

export type EstadisticasVoluntariosDto = {
  totalHoras: number;
  voluntariosActivos: number;
  promedioHorasPorVoluntario: number;
  tasaAprobacion: number;
  topVoluntarios: { nombre: string; horas: number }[];
  participacionesPorTipo: {
  Entrenamiento: number;
  Emergencia: number;
  Simulacros: number;
  };
};

export type PaginatedDto = {
  descripcion?: string;
  voluntario?: string;
  tipoActividad?: TipoActividad;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: 'aprobada' | 'pendiente' | 'rechazada';
  
  page?: number;
  limit?: number;
};

export type PaginatedResponse = {
  data: Participacion[];
  total: number;
  page: number;
  totalPages: number;
};