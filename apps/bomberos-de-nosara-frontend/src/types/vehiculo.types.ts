// Enums para tipos y estados
export type EstadoVehiculo = 'en servicio' | 'malo' | 'fuera de servicio' | 'dado de baja';

export type TipoVehiculo = 
  | 'camión sisterna' 
  | 'carro ambulancia' 
  | 'pickup utilitario' 
  | 'moto'
  | 'atv' 
  | 'jet ski' 
  | 'lancha rescate' 
  | 'dron reconocimiento';

export type EstadoInicial = 'nuevo' | 'usado';

// Interface principal del vehículo
export interface Vehicle {
  id: string;
  placa: string;
  tipo: TipoVehiculo;
  estadoInicial: EstadoInicial;
  estadoActual: EstadoVehiculo;
  fechaAdquisicion: string; // ISO date
  kilometraje: number;
  fotoUrl?: string;
  observaciones?: string;
  
  // Información de mantenimiento programado
  fechaProximoMantenimiento?: string; // ISO date
  tipoMantenimiento?: 'preventivo' | 'correctivo' | 'inspección';
  prioridadMantenimiento?: 'baja' | 'media' | 'alta';
  
  // Información de reposición (cuando está dado de baja)
  motivoReposicion?: string;
  fechaBaja?: string; // ISO date
  
  // Información de auditoría
  createdAt?: string; // ISO date
  updatedAt?: string; // ISO date
  createdBy?: number; // ID del usuario que creó (CAMBIO: era string, ahora number)
  updatedBy?: number; // ID del usuario que actualizó (CAMBIO: era string, ahora number)
  deletedBy?: number | null; // ID del usuario que eliminó (NUEVO)
}

// Types para mantenimiento
export interface MantenimientoData {
  fecha: string;
  descripcion: string;
  kilometraje: number;
  tecnico: string;
  costo: number;
  observaciones?: string;
}

export interface MantenimientoProgramadoData {
  fechaProximoMantenimiento: string;
  tecnico: string;
  tipo: 'preventivo' | 'correctivo' | 'inspección';
  prioridad: 'baja' | 'media' | 'alta';
  observaciones?: string;
}

// Types para reposición
export interface ReposicionData {
  motivo: string;
  observaciones?: string;
}

// Types para respuestas de API
export interface ApiErrorPayload {
  code?: string;
  field?: string;
  message?: string;
  details?: any;
  statusCode?: number;
}