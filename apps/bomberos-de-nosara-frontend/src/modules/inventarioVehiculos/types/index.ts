// src/modules/inventarioVehiculos/types/index.ts

import type { Vehiculo, TipoVehiculo, EstadoVehiculo, EstadoInicial } from '../../../types/vehiculo.types';
import type { Mantenimiento, TipoMantenimiento } from '../../../types/mantenimiento.types';

// ==================== NAVEGACIÓN Y VISTAS ====================

export type VehiculoView =
  | 'inicio'
  | 'agregar'
  | 'detalles'
  | 'editar'
  | 'estado'
  | 'programar'
  | 'registrar'
  | 'completar'
  | 'historial'
  | 'lista'
  | 'dashboard';

// ==================== PROPS DE COMPONENTES ====================

export interface VehicleListProps {
  vehicles: Vehiculo[];
  onUpdateVehicle: (id: string, updates: Partial<Vehiculo>) => void;
  getVehicleIcon: (type: string, className?: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  onEstado: (vehiculo: Vehiculo) => void;
  onVerDetalles: (vehiculo: Vehiculo) => void;
  onEditar: (vehiculo: Vehiculo) => void;
}

export interface DashboardVehiculoProps {
  overrideModal?: (modalKey: VehiculoView, vehiculo?: Vehiculo) => void;
}

// ==================== PROPS DE MODALES ====================

export interface AddVehicleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface DetallesVehiculoProps {
  vehiculo: Vehiculo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenModal?: (view: VehiculoView, vehiculo?: Vehiculo) => void;
}

export interface EditVehiculoProps {
  vehiculo: Vehiculo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface CambiarEstadoProps {
  vehiculo: Vehiculo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface ProgramarMantenimientoProps {
  vehiculoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface RegistrarMantenimientoProps {
  vehiculoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface CompletarMantenimientoProps {
  mantenimiento: Mantenimiento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface HistorialMantenimientosProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ==================== TYPES PARA FORMULARIOS ====================

export interface CreateVehicleFormValues {
  placa: string;
  tipo: TipoVehiculo;
  estadoInicial: EstadoInicial;
  estadoActual: EstadoVehiculo;
  fechaAdquisicion: string;
  kilometraje: number;
}

export interface EditVehicleFormValues {
  placa?: string;
  tipo?: TipoVehiculo;
  estadoInicial?: EstadoInicial;
  fechaAdquisicion?: string;
  kilometraje?: number;
}

export interface CambiarEstadoFormValues {
  estadoActual: EstadoVehiculo;
  motivo?: string;
}

// ✅ EXPORTAR TYPES DE ZOD (eliminamos las interfaces manuales)
export type { 
  ProgramarMantenimientoFormData,
  RegistrarMantenimientoFormData,
  CompletarMantenimientoFormData 
} from '../utils/vehiculoValidations';

// ==================== TYPES PARA FILTROS ====================

export interface VehiculoFilters {
  search?: string;
  status?: EstadoVehiculo;
  type?: TipoVehiculo;
}

export interface MantenimientoFiltersLocal {
  fechaInicio?: string;
  fechaFin?: string;
  estado?: string;
  tipo?: TipoMantenimiento;
  vehiculoId?: string;
}

// Props para ProgramarMantenimientoModal
export interface ProgramarMantenimientoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface CompletarMantenimientoModalProps {
  mantenimiento: Mantenimiento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface DetallesMantenimientoModalProps {
  mantenimiento: Mantenimiento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ==================== TYPES PARA TABS DE HISTORIAL ====================

export type HistorialTab = 'por-periodo' | 'por-vehiculo';

export interface TabPorPeriodoProps {
  mantenimientos: Mantenimiento[];
  isLoading?: boolean;
  onCompletar?: (mantenimiento: Mantenimiento) => void;
}

export interface TabPorVehiculoProps {
  vehiculos: Vehiculo[];
  onSelectVehiculo: (vehiculoId: string) => void;
  selectedVehiculoId?: string;
  mantenimientos: Mantenimiento[];
  isLoading?: boolean;
  onProgramar?: (vehiculoId: string) => void;
  onRegistrar?: (vehiculoId: string) => void;
}

// ==================== OPCIONES PARA SELECTS ====================

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export type TipoVehiculoOption = SelectOption<TipoVehiculo>;
export type EstadoVehiculoOption = SelectOption<EstadoVehiculo>;
export type EstadoInicialOption = SelectOption<EstadoInicial>;
export type TipoMantenimientoOption = SelectOption<TipoMantenimiento>;