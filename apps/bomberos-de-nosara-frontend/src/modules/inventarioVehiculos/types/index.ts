// src/modules/inventarioVehiculos/types/index.ts

import type { Vehicle } from '../../../types/vehiculo.types';

// Navegación específica del módulo
export type VehiculoView =
  | 'inicio'
  | 'agregar'
  | 'estado'
  | 'programar'
  | 'registrar'
  | 'reposicion'
  | 'mantenimiento'
  | 'lista'
  | 'dashboard'
  | 'detalles'
  | 'editar';

// Props de componentes específicos del módulo
export interface VehicleListProps {
  vehicles: Vehicle[];
  onUpdateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  getVehicleIcon: (type: string, className?: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  onEstado: (vehiculo: Vehicle) => void;
  onVerDetalles: (vehiculo: Vehicle) => void;
  onEditar: (vehiculo: Vehicle) => void;
}

export interface UpdateStatusProps {
  vehiculo?: Vehicle;
  onClose: () => void;
}

export interface ScheduleMaintenanceProps {
  vehiculoId?: string;
  fechaActual?: string;
  onClose: () => void;
}

export interface RecordMaintenanceProps {
  vehiculoId?: string;
  onClose: () => void;
}

export interface DashboardVehiculoProps {
  overrideModal?: (modalKey: VehiculoView, vehiculo?: Vehicle) => void;
}

export interface AddVehicleProps {
  onSuccess?: () => void;
}

export interface MantenimientoVehiculoProps {
  onBack: () => void;
}

export interface HistorialMantenimientosProps {
  onClose: () => void;
}

export interface NotifyReplacementProps {
  vehiculoId?: string;
  onClose: () => void;
}

export interface DetallesVehiculoProps {
  vehiculo: Vehicle;
  onClose: () => void;
}

export interface EditVehiculoProps {
  vehiculo: Vehicle;
  onClose: () => void;
  onSuccess?: () => void;
}

// Types específicos para formularios
export type FormValues = Omit<Vehicle, 'id'>;

// Types para el historial (específico del módulo)
export interface ItemHistorial {
  id: string;
  fecha: string;
  descripcion: string;
  kilometraje: number;
  tecnico: string;
  costo: number;
  observaciones?: string;
  
  // Campos de auditoría
  created_by?: number;
  createdAt?: string | Date;
  updated_by?: number;
  updatedAt?: string | Date;
  deleted_by?: number;
  deletedAt?: string | Date;
}

// Constantes y opciones específicas del módulo
export interface TipoOption {
  value: Vehicle['tipo'];
  label: string;
}

export interface EstadoOption {
  value: Vehicle['estadoActual'];
  label: string;
}

export interface FilterOption {
  label: string;
  value: string;
}