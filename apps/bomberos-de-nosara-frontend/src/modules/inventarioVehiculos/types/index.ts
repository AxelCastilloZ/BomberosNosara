import type { Vehiculo, TipoVehiculo, EstadoVehiculo } from '../../../types/vehiculo.types';
import type { Mantenimiento } from '../../../types/mantenimiento.types';

// ==================== NAVEGACIÓN ====================

export type VehiculoView =
  | 'inicio'
  | 'agregar'
  | 'estado'
  | 'programar'
  | 'registrar'
  | 'mantenimiento'
  | 'lista'
  | 'dashboard'
  | 'detalles'
  | 'editar'
  | 'historial';

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

export interface UpdateStatusProps {
  vehiculo?: Vehiculo;
  onClose: () => void;
}

export interface ScheduleMaintenanceProps {
  vehiculoId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface RecordMaintenanceProps {
  vehiculoId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface CompletarMantenimientoProps {
  mantenimientoId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface DashboardVehiculoProps {
  overrideModal?: (modalKey: VehiculoView, vehiculo?: Vehiculo) => void;
}

export interface AddVehicleProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export interface MantenimientoVehiculoProps {
  onBack: () => void;
}

export interface HistorialMantenimientosProps {
  onClose: () => void;
}

export interface DetallesVehiculoProps {
  vehiculo: Vehiculo;
  onClose: () => void;
}

export interface EditVehiculoProps {
  vehiculo: Vehiculo;
  onClose: () => void;
  onSuccess?: () => void;
}

// ==================== TYPES PARA FORMULARIOS ====================

// Para el formulario de crear vehículo
export interface CreateVehicleFormValues {
  placa: string;
  tipo: TipoVehiculo;
  estadoInicial: 'nuevo' | 'usado';
  estadoActual: EstadoVehiculo;
  fechaAdquisicion: string;
  kilometraje: number;
  observaciones?: string;
}

// Para el formulario de editar vehículo
export interface EditVehicleFormValues {
  placa?: string;
  tipo?: TipoVehiculo;
  fechaAdquisicion?: string;
  kilometraje?: number;
  estadoActual?: EstadoVehiculo;
  observaciones?: string;
  observacionesProblema?: string; // Si estadoActual = MALO
  motivoBaja?: string; // Si estadoActual = BAJA
}

// ==================== TYPES PARA MANTENIMIENTOS ====================

export type MantenimientoItem = Mantenimiento;

// ==================== OPCIONES PARA SELECTS ====================

export interface TipoVehiculoOption {
  value: TipoVehiculo;
  label: string;
}

export interface EstadoVehiculoOption {
  value: EstadoVehiculo;
  label: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

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
  vehiculoId?: string;
}

// ==================== TYPES PARA TABS ====================

export type HistorialTab = 'por-periodo' | 'por-vehiculo';

export interface TabPorPeriodoProps {
  mantenimientos: Mantenimiento[];
  isLoading?: boolean;
}

export interface TabPorVehiculoProps {
  vehiculos: Vehiculo[];
  onSelectVehiculo: (vehiculoId: string) => void;
  selectedVehiculoId?: string;
  mantenimientos: Mantenimiento[];
  isLoading?: boolean;
}