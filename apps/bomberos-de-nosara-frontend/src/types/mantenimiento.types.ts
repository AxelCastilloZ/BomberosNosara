import type { Vehiculo } from './vehiculo.types';

// ==================== ENUM ====================

export enum EstadoMantenimiento {
  PENDIENTE = 'pendiente',
  EN_REVISION = 'en_revision',
  COMPLETADO = 'completado',
}

// ==================== ENTIDAD PRINCIPAL ====================

export interface Mantenimiento {
  // Identificación
  id: string;

  // Relación con vehículo
  vehiculoId: string;
  vehiculo?: Vehiculo; // Opcional cuando no viene populated

  // Estado
  estado: EstadoMantenimiento;

  // Información básica
  fecha: string; // ISO date string
  descripcion: string;

  // Datos de completado (opcionales hasta completar)
  kilometraje?: number;
  tecnico?: string;
  costo?: number;
  observaciones?: string;

  // Auditoría
  createdBy: number;
  updatedBy: number;
  deletedBy?: number | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt?: string | null; // ISO date string
}

// ==================== DTOs PARA REQUESTS ====================

export interface ProgramarMantenimientoDto {
  fecha: string; // ISO date string - debe ser futura
  descripcion: string;
  observaciones?: string;
}

export interface RegistrarMantenimientoDto {
  fecha: string; // ISO date string - debe ser pasada o presente
  descripcion: string;
  kilometraje: number;
  tecnico: string;
  costo: number;
  observaciones?: string;
}

export interface CompletarMantenimientoDto {
  kilometraje: number;
  tecnico: string;
  costo: number;
  observaciones?: string;
}

export interface CambiarEstadoMantenimientoDto {
  estado: EstadoMantenimiento;
}

// ==================== DTOs PARA REPORTES ====================

export interface ReporteCostosMensuales {
  total: number;
  mantenimientos: Mantenimiento[];
}

export interface ReporteCostosPorVehiculo {
  total: number;
  mantenimientos: Mantenimiento[];
}

export interface CostosMensualesQuery {
  mes: number; // 1-12
  anio: number; // YYYY
}

export interface CostosPorVehiculoQuery {
  mes?: number; // 1-12
  anio?: number; // YYYY
}

// ==================== TYPES AUXILIARES ====================

export interface EstadoMantenimientoOption {
  value: EstadoMantenimiento;
  label: string;
}

// Para filtros en el frontend
export interface MantenimientoFilters {
  fechaInicio?: string; // ISO date string
  fechaFin?: string; // ISO date string
  estado?: EstadoMantenimiento;
  vehiculoId?: string;
}

// Para estadísticas calculadas en frontend
export interface EstadisticasMantenimiento {
  total: number;
  pendientes: number;
  enRevision: number;
  completados: number;
  costoTotal: number;
  costoPromedio: number;
}