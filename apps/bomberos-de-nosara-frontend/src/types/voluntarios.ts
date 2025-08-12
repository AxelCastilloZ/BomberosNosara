export enum TipoActividad {
  ENTRENAMIENTO = 'Entrenamiento',
  EMERGENCIA = 'Emergencia',
  SERVICIO_COMUNITARIO = 'Servicio Comunitario',
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