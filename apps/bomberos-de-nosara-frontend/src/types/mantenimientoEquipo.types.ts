

// types/mantenimientoEquipo.types.ts

import type { EquipoBomberil } from './equipoBomberil.types';

// ==================== ENUMS ====================

export enum EstadoMantenimiento {
  PENDIENTE = 'pendiente',
  EN_REVISION = 'en_revision',
  COMPLETADO = 'completado',
}

export enum TipoMantenimiento {
  PREVENTIVO = 'preventivo',
  CORRECTIVO = 'correctivo',
}

// ==================== ENTIDAD PRINCIPAL ====================

export interface MantenimientoEquipo {
  // Identificación
  id: string;

  // Relación con equipo
  equipoId: string;
  equipo?: EquipoBomberil; // Opcional cuando no viene populated

  // Estado y tipo
  estado: EstadoMantenimiento;
  tipo: TipoMantenimiento;

  // Información básica
  fecha: string; // ISO date string
  descripcion: string;

  // Datos de completado (opcionales hasta completar)
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
  tipo: TipoMantenimiento;
  fecha: string; // ISO date string - debe ser futura
  descripcion: string;
  observaciones?: string;
}

export interface RegistrarMantenimientoDto {
  tipo: TipoMantenimiento;
  fecha: string; // ISO date string - debe ser pasada o presente
  descripcion: string;
  tecnico: string;
  costo: number;
  observaciones?: string;
}

export interface CompletarMantenimientoDto {
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
  mantenimientos: MantenimientoEquipo[];
}

export interface ReporteCostosPorEquipo {
  total: number;
  mantenimientos: MantenimientoEquipo[];
}

export interface CostosMensualesQuery {
  mes: number; // 1-12
  anio: number; // YYYY
}

export interface CostosPorEquipoQuery {
  mes?: number; // 1-12
  anio?: number; // YYYY
}

// ==================== TYPES AUXILIARES ====================

export interface EstadoMantenimientoOption {
  value: EstadoMantenimiento;
  label: string;
}

export interface TipoMantenimientoOption {
  value: TipoMantenimiento;
  label: string;
}

// Para filtros en el frontend
export interface MantenimientoFilters {
  fechaInicio?: string; // ISO date string
  fechaFin?: string; // ISO date string
  estado?: EstadoMantenimiento;
  tipo?: TipoMantenimiento;
  equipoId?: string;
}

// Para estadísticas calculadas en frontend
export interface EstadisticasMantenimiento {
  total: number;
  pendientes: number;
  enRevision: number;
  completados: number;
  costoTotal: number;
  costoPromedio: number;
  preventivos: number;
  correctivos: number;
}