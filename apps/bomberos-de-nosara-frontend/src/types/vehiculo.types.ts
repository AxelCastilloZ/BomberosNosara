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
  observaciones?: string;

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

export interface CreateVehiculoDto {
  placa: string;
  tipo: TipoVehiculo;
  estadoInicial: EstadoInicial;
  estadoActual: EstadoVehiculo;
  fechaAdquisicion: string; // ISO date string
  kilometraje: number;
  observaciones?: string;
}

export interface EditVehiculoDto {
  kilometraje?: number;
  estadoActual?: EstadoVehiculo;
  observaciones?: string;
  placa?: string;
  tipo?: TipoVehiculo;
  fechaAdquisicion?: string; // ISO date string

  // Campos condicionales según estado
  observacionesProblema?: string; // Requerido si estadoActual = MALO
  motivoBaja?: string; // Requerido si estadoActual = BAJA
}

export interface UpdateEstadoDto {
  estadoActual: EstadoVehiculo;
  observaciones?: string;
  observacionesProblema?: string; // Si es MALO
  motivoBaja?: string; // Si es BAJA
}

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

// ==================== TYPES AUXILIARES ====================

export interface TipoVehiculoOption {
  value: TipoVehiculo;
  label: string;
}

export interface EstadoVehiculoOption {
  value: EstadoVehiculo;
  label: string;
}

// Importar Mantenimiento para la relación
import type { Mantenimiento } from './mantenimiento.types';