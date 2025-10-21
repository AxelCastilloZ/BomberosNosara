import type { Vehiculo } from './vehiculo.types';
import type { Mantenimiento } from './mantenimiento.types';

// ==================== PAGINACIÓN ====================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedVehiculoResponse extends PaginatedResponse<Vehiculo> {}

export interface PaginatedMantenimientoResponse extends PaginatedResponse<Mantenimiento> {}

// ==================== RESPUESTAS DE OPERACIONES ====================

export interface DeleteResponse {
  message: string;
}

export interface ExistsResponse {
  exists: boolean;
}

// ==================== ERRORES DE API ====================

export interface ApiErrorPayload {
  code?: string;
  field?: string;
  message?: string;
  details?: any;
  statusCode?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  code?: string;
  validation?: ValidationError[];
}

// ==================== RESPUESTAS ESPECÍFICAS ====================

// Para el endpoint de próximo mantenimiento
export interface ProximoMantenimientoResponse {
  mantenimiento: Mantenimiento | null;
}

// Para el endpoint de mantenimientos del día
export interface MantenimientosDelDiaResponse {
  mantenimientos: Mantenimiento[];
  total: number;
}

// Para el endpoint de mantenimientos para notificar
export interface MantenimientosParaNotificarResponse {
  mantenimientos: Mantenimiento[];
  total: number;
}