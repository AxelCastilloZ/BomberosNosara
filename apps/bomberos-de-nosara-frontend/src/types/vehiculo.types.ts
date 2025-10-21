// src/types/vehiculo.types.ts

// ==================== ENUMS ====================

export enum EstadoVehiculo {
  EN_SERVICIO = 'en servicio',
  MALO = 'malo',
  FUERA_DE_SERVICIO = 'fuera de servicio',
  BAJA = 'dado de baja',
}

export enum TipoVehiculo {
  CAMION_CISTERNA = 'camión sisterna',
  CARRO_AMBULANCIA = 'carro ambulancia',
  PICKUP_UTILITARIO = 'pickup utilitario',
  MOTO = 'moto',
  ATV = 'atv',
  JET_SKI = 'jet ski',
  LANCHA_RESCATE = 'lancha rescate',
  DRON_RECONOCIMIENTO = 'dron reconocimiento',
}

export type EstadoInicial = 'nuevo' | 'usado';

// ==================== ENTIDAD PRINCIPAL ====================

export interface Vehiculo {
  // Identificación
  id: string;
  placa: string;
  tipo: TipoVehiculo;

  // Estado y condición
  estadoInicial: EstadoInicial;
  estadoActual: EstadoVehiculo;

  // Información operativa
  fechaAdquisicion: string; // ISO date string
  kilometraje: number;
  observaciones?: string; // ✅ Log automático (solo lectura en la UI)

  // Relaciones
  mantenimientos?: Mantenimiento[]; // Opcional cuando no viene populated

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
 * DTO para crear un nuevo vehículo
 * El backend crea automáticamente el campo observaciones vacío
 */
export interface CreateVehiculoDto {
  placa: string;
  tipo: TipoVehiculo;
  estadoInicial: EstadoInicial;
  estadoActual: EstadoVehiculo;
  fechaAdquisicion: string; // ISO date string (YYYY-MM-DD)
  kilometraje: number;
}

/**
 * DTO para editar un vehículo existente
 * Todos los campos son opcionales
 */
export interface EditVehiculoDto {
  placa?: string;
  tipo?: TipoVehiculo;
  estadoInicial?: EstadoInicial; 
  fechaAdquisicion?: string;
  kilometraje?: number;
}

/**
 * DTO para cambiar solo el estado de un vehículo
 * Endpoint: PATCH /vehiculos/:id/estado
 */
export interface UpdateEstadoDto {
  estadoActual: EstadoVehiculo;
}

/**
 * DTO para dar de baja un vehículo
 * Endpoint: PATCH /vehiculos/:id/dar-de-baja
 */
export interface DarDeBajaDto {
  motivo: string;
}

// ==================== DTOs PARA QUERIES ====================

export interface PaginatedVehiculoQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: EstadoVehiculo;
  type?: TipoVehiculo;
}

export interface PaginatedVehiculoResponseDto {
  data: Vehiculo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== IMPORT DE MANTENIMIENTO ====================

import type { Mantenimiento } from './mantenimiento.types';