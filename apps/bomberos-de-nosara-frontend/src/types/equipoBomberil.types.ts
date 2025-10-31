

// types/equipoBomberil.types.ts

// ==================== ENUMS ====================

export enum EstadoEquipo {
  EN_SERVICIO = 'en_servicio',
  MALO = 'malo',
  FUERA_DE_SERVICIO = 'fuera_de_servicio',
  BAJA = 'baja',
}

export enum TipoEquipo {
  MOTOGUADANA = 'motoguadaña',
  SOPLADORA = 'sopladora',
  TRONZADORA = 'tronzadora',
  MOTOSIERRA = 'motosierra',
  BOMBA_AGUA = 'bomba_agua',
}

export type EstadoInicial = 'nuevo' | 'usado';

// ==================== ENTIDAD PRINCIPAL ====================

export interface EquipoBomberil {
  // Identificación
  id: string;
  numeroSerie: string;
  nombre: string;
  tipo: TipoEquipo;

  // Estado y condición
  estadoInicial: EstadoInicial;
  estadoActual: EstadoEquipo;

  // Información operativa
  fechaAdquisicion: string; // ISO date string
  observaciones?: string; // ✅ Log automático (solo lectura en la UI)

  // Relaciones
  mantenimientos?: MantenimientoEquipo[]; // Opcional cuando no viene populated

  // Auditoría
  createdBy: number;
  updatedBy: number;
  deletedBy?: number | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt?: string | null; // ISO date string
}

// ==================== DTOs PARA REQUESTS ====================

/**
 * DTO para crear un nuevo equipo
 * El backend crea automáticamente el campo observaciones vacío
 */
export interface CreateEquipoDto {
  numeroSerie: string;
  nombre: string;
  tipo: TipoEquipo;
  estadoInicial: EstadoInicial;
  estadoActual: EstadoEquipo;
  fechaAdquisicion: string; // ISO date string (YYYY-MM-DD)
}

/**
 * DTO para editar un equipo existente
 * Todos los campos son opcionales
 */
export interface EditEquipoDto {
  numeroSerie?: string;
  nombre?: string;
  tipo?: TipoEquipo;
  estadoInicial?: EstadoInicial;
  fechaAdquisicion?: string;
}

/**
 * DTO para cambiar solo el estado de un equipo
 * Endpoint: PATCH /equipos/:id/estado
 */
export interface UpdateEstadoDto {
  estadoActual: EstadoEquipo;
}

/**
 * DTO para dar de baja un equipo
 * Endpoint: PATCH /equipos/:id/dar-de-baja
 */
export interface DarDeBajaDto {
  motivo: string;
}

// ==================== DTOs PARA QUERIES ====================

export interface PaginatedEquipoQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: EstadoEquipo;
  type?: TipoEquipo;
}

export interface PaginatedEquipoResponseDto {
  data: EquipoBomberil[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== IMPORT DE MANTENIMIENTO ====================

import type { MantenimientoEquipo } from './mantenimientoEquipo.types';