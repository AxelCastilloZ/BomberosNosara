

// src/modules/inventarioEquipos/types/index.ts

import type { EquipoBomberil, TipoEquipo, EstadoEquipo, EstadoInicial } from '../../../types/equipoBomberil.types';
import type { MantenimientoEquipo, TipoMantenimiento } from '../../../types/mantenimientoEquipo.types';

// ==================== NAVEGACIÓN Y VISTAS ====================

export type EquipoView =
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

export interface EquipoListProps {
  equipos: EquipoBomberil[];
  onUpdateEquipo: (id: string, updates: Partial<EquipoBomberil>) => void;
  getEquipoIcon: (type: string, className?: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  onEstado: (equipo: EquipoBomberil) => void;
  onVerDetalles: (equipo: EquipoBomberil) => void;
  onEditar: (equipo: EquipoBomberil) => void;
}

export interface DashboardEquipoProps {
  overrideModal?: (modalKey: EquipoView, equipo?: EquipoBomberil) => void;
}

// ==================== PROPS DE MODALES ====================

export interface AddEquipoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface DetallesEquipoProps {
  equipo: EquipoBomberil | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenModal?: (view: EquipoView, equipo?: EquipoBomberil) => void;
}

export interface EditEquipoProps {
  equipo: EquipoBomberil | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface CambiarEstadoProps {
  equipo: EquipoBomberil | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface ProgramarMantenimientoProps {
  equipoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface RegistrarMantenimientoProps {
  equipoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface CompletarMantenimientoProps {
  mantenimiento: MantenimientoEquipo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface HistorialMantenimientosProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ==================== TYPES PARA FORMULARIOS ====================

export interface CreateEquipoFormValues {
  numeroSerie: string;
  nombre: string;
  tipo: TipoEquipo;
  estadoInicial: EstadoInicial;
  estadoActual: EstadoEquipo;
  fechaAdquisicion: string;
}

export interface EditEquipoFormValues {
  numeroSerie?: string;
  nombre?: string;
  tipo?: TipoEquipo;
  estadoInicial?: EstadoInicial;
  fechaAdquisicion?: string;
}

export interface CambiarEstadoFormValues {
  estadoActual: EstadoEquipo;
  motivo?: string;
}

// ✅ EXPORTAR TYPES DE ZOD (eliminaremos las interfaces manuales cuando creemos las validations)
export type { 
  ProgramarMantenimientoFormData,
  RegistrarMantenimientoFormData,
  CompletarMantenimientoFormData 
} from '../utils/equipoBomberilValidations';

// ==================== TYPES PARA FILTROS ====================

export interface EquipoFilters {
  search?: string;
  status?: EstadoEquipo;
  type?: TipoEquipo;
}

export interface MantenimientoFiltersLocal {
  fechaInicio?: string;
  fechaFin?: string;
  estado?: string;
  tipo?: TipoMantenimiento;
  equipoId?: string;
}

// Props para ProgramarMantenimientoModal
export interface ProgramarMantenimientoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface CompletarMantenimientoModalProps {
  mantenimiento: MantenimientoEquipo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface DetallesMantenimientoModalProps {
  mantenimiento: MantenimientoEquipo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ==================== TYPES PARA TABS DE HISTORIAL ====================

export type HistorialTab = 'por-periodo' | 'por-equipo';

export interface TabPorPeriodoProps {
  mantenimientos: MantenimientoEquipo[];
  isLoading?: boolean;
  onCompletar?: (mantenimiento: MantenimientoEquipo) => void;
}

export interface TabPorEquipoProps {
  equipos: EquipoBomberil[];
  onSelectEquipo: (equipoId: string) => void;
  selectedEquipoId?: string;
  mantenimientos: MantenimientoEquipo[];
  isLoading?: boolean;
  onProgramar?: (equipoId: string) => void;
  onRegistrar?: (equipoId: string) => void;
}

// ==================== OPCIONES PARA SELECTS ====================

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export type TipoEquipoOption = SelectOption<TipoEquipo>;
export type EstadoEquipoOption = SelectOption<EstadoEquipo>;
export type EstadoInicialOption = SelectOption<EstadoInicial>;
export type TipoMantenimientoOption = SelectOption<TipoMantenimiento>;