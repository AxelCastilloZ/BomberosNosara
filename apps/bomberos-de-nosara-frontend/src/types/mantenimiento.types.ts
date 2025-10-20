import type { Vehiculo } from './vehiculo.types';

// ==================== ENUMS ====================

export enum EstadoMantenimiento {
  PENDIENTE = 'pendiente',
  EN_REVISION = 'en_revision',
  COMPLETADO = 'completado',
}

// ✅ AGREGADO: Enum de tipo de mantenimiento
export enum TipoMantenimiento {
  PREVENTIVO = 'preventivo',
  CORRECTIVO = 'correctivo',
}

// ==================== ENTIDAD PRINCIPAL ====================

export interface Mantenimiento {
  // Identificación
  id: string;

  // Relación con vehículo
  vehiculoId: string;
  vehiculo?: Vehiculo; // Opcional cuando no viene populated

  // Estado y tipo
  estado: EstadoMantenimiento;
  tipo: TipoMantenimiento; // ✅ AGREGADO

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
  tipo: TipoMantenimiento; // ✅ AGREGADO
  fecha: string; // ISO date string - debe ser futura
  descripcion: string;
  observaciones?: string;
}

export interface RegistrarMantenimientoDto {
  tipo: TipoMantenimiento; // ✅ AGREGADO
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
  // ❌ NO lleva tipo (ya existe en el mantenimiento)
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

// ✅ AGREGADO: Options para el Select de tipo
export interface TipoMantenimientoOption {
  value: TipoMantenimiento;
  label: string;
}

// Para filtros en el frontend
export interface MantenimientoFilters {
  fechaInicio?: string; // ISO date string
  fechaFin?: string; // ISO date string
  estado?: EstadoMantenimiento;
  tipo?: TipoMantenimiento; // ✅ AGREGADO
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
  // ✅ AGREGADO: Stats por tipo
  preventivos: number;
  correctivos: number;
}