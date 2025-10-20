import { 
  Truck, 
  Ambulance, 
  TruckIcon,
  Bike,
  Waves,
  Ship,
  Plane,
  type LucideIcon 
} from 'lucide-react';
import { EstadoVehiculo, TipoVehiculo } from '../../../types/vehiculo.types';
import { EstadoMantenimiento } from '../../../types/mantenimiento.types';

// ==================== ICONOS DE VEHÍCULOS ====================

export const getVehiculoIcon = (tipo: TipoVehiculo): LucideIcon => {
  const iconMap: Record<TipoVehiculo, LucideIcon> = {
    [TipoVehiculo.CAMION_CISTERNA]: Truck,
    [TipoVehiculo.CARRO_AMBULANCIA]: Ambulance,
    [TipoVehiculo.PICKUP_UTILITARIO]: TruckIcon,
    [TipoVehiculo.MOTO]: Bike,
    [TipoVehiculo.ATV]: Bike, // Mismo ícono que moto
    [TipoVehiculo.JET_SKI]: Waves,
    [TipoVehiculo.LANCHA_RESCATE]: Ship,
    [TipoVehiculo.DRON_RECONOCIMIENTO]: Plane,
  };

  return iconMap[tipo] || Truck;
};

// ==================== COLORES DE ESTADO ====================

export const getEstadoVehiculoColor = (estado: EstadoVehiculo): string => {
  const colorMap: Record<EstadoVehiculo, string> = {
    [EstadoVehiculo.EN_SERVICIO]: 'text-green-600 bg-green-50 border-green-200',
    [EstadoVehiculo.MALO]: 'text-orange-600 bg-orange-50 border-orange-200',
    [EstadoVehiculo.FUERA_DE_SERVICIO]: 'text-red-600 bg-red-50 border-red-200',
    [EstadoVehiculo.BAJA]: 'text-gray-600 bg-gray-50 border-gray-200',
  };

  return colorMap[estado] || 'text-gray-600 bg-gray-50 border-gray-200';
};

export const getEstadoMantenimientoColor = (estado: EstadoMantenimiento): string => {
  const colorMap: Record<EstadoMantenimiento, string> = {
    [EstadoMantenimiento.PENDIENTE]: 'text-blue-600 bg-blue-50 border-blue-200',
    [EstadoMantenimiento.EN_REVISION]: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    [EstadoMantenimiento.COMPLETADO]: 'text-green-600 bg-green-50 border-green-200',
  };

  return colorMap[estado] || 'text-gray-600 bg-gray-50 border-gray-200';
};

// ==================== LABELS AMIGABLES ====================

export const getEstadoVehiculoLabel = (estado: EstadoVehiculo): string => {
  const labelMap: Record<EstadoVehiculo, string> = {
    [EstadoVehiculo.EN_SERVICIO]: 'En servicio',
    [EstadoVehiculo.MALO]: 'Malo',
    [EstadoVehiculo.FUERA_DE_SERVICIO]: 'Fuera de servicio',
    [EstadoVehiculo.BAJA]: 'Dado de baja',
  };

  return labelMap[estado] || estado;
};

export const getEstadoMantenimientoLabel = (estado: EstadoMantenimiento): string => {
  const labelMap: Record<EstadoMantenimiento, string> = {
    [EstadoMantenimiento.PENDIENTE]: 'Pendiente',
    [EstadoMantenimiento.EN_REVISION]: 'En revisión',
    [EstadoMantenimiento.COMPLETADO]: 'Completado',
  };

  return labelMap[estado] || estado;
};

export const getTipoVehiculoLabel = (tipo: TipoVehiculo): string => {
  const labelMap: Record<TipoVehiculo, string> = {
    [TipoVehiculo.CAMION_CISTERNA]: 'Camión Cisterna',
    [TipoVehiculo.CARRO_AMBULANCIA]: 'Carro Ambulancia',
    [TipoVehiculo.PICKUP_UTILITARIO]: 'Pickup Utilitario',
    [TipoVehiculo.MOTO]: 'Moto',
    [TipoVehiculo.ATV]: 'ATV',
    [TipoVehiculo.JET_SKI]: 'Jet Ski',
    [TipoVehiculo.LANCHA_RESCATE]: 'Lancha de Rescate',
    [TipoVehiculo.DRON_RECONOCIMIENTO]: 'Dron de Reconocimiento',
  };

  return labelMap[tipo] || tipo;
};

// ==================== FORMATEO DE DATOS ====================

export const formatKilometraje = (km: number): string => {
  return new Intl.NumberFormat('es-CR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(km) + ' km';
};

export const formatCosto = (costo: number): string => {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(costo);
};




export const formatCostoDolares = (costo: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(costo);
};

export const formatFecha = (fecha: string | Date): string => {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  return new Intl.DateTimeFormat('es-CR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatFechaCorta = (fecha: string | Date): string => {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  return new Intl.DateTimeFormat('es-CR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

export const formatFechaRelativa = (fecha: string | Date): string => {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays === -1) return 'Mañana';
  if (diffDays < 7 && diffDays > 0) return `Hace ${diffDays} días`;
  if (diffDays < 0 && diffDays > -7) return `En ${Math.abs(diffDays)} días`;
  
  return formatFechaCorta(fecha);
};

// ==================== OPCIONES PARA SELECTS ====================

export const TIPO_VEHICULO_OPTIONS = [
  { value: TipoVehiculo.CAMION_CISTERNA, label: 'Camión Cisterna' },
  { value: TipoVehiculo.CARRO_AMBULANCIA, label: 'Carro Ambulancia' },
  { value: TipoVehiculo.PICKUP_UTILITARIO, label: 'Pickup Utilitario' },
  { value: TipoVehiculo.MOTO, label: 'Moto' },
  { value: TipoVehiculo.ATV, label: 'ATV' },
  { value: TipoVehiculo.JET_SKI, label: 'Jet Ski' },
  { value: TipoVehiculo.LANCHA_RESCATE, label: 'Lancha de Rescate' },
  { value: TipoVehiculo.DRON_RECONOCIMIENTO, label: 'Dron de Reconocimiento' },
];

export const ESTADO_VEHICULO_OPTIONS = [
  { value: EstadoVehiculo.EN_SERVICIO, label: 'En servicio' },
  { value: EstadoVehiculo.MALO, label: 'Malo' },
  { value: EstadoVehiculo.FUERA_DE_SERVICIO, label: 'Fuera de servicio' },
  { value: EstadoVehiculo.BAJA, label: 'Dado de baja' },
];

export const ESTADO_INICIAL_OPTIONS = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'usado', label: 'Usado' },
];

export const ESTADO_MANTENIMIENTO_OPTIONS = [
  { value: EstadoMantenimiento.PENDIENTE, label: 'Pendiente' },
  { value: EstadoMantenimiento.EN_REVISION, label: 'En revisión' },
  { value: EstadoMantenimiento.COMPLETADO, label: 'Completado' },
];

// ==================== VALIDACIONES SIMPLES ====================

export const esFechaFutura = (fecha: string | Date): boolean => {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date > now;
};

export const esFechaPasada = (fecha: string | Date): boolean => {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < now;
};

export const calcularDiasHasta = (fecha: string | Date): number => {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffMs = date.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// ==================== UTILIDADES DE ESTADÍSTICAS ====================

export const calcularCostoTotal = (mantenimientos: Array<{ costo?: number }>): number => {
  return mantenimientos.reduce((sum, m) => sum + (m.costo || 0), 0);
};

export const calcularCostoPromedio = (mantenimientos: Array<{ costo?: number }>): number => {
  if (mantenimientos.length === 0) return 0;
  return calcularCostoTotal(mantenimientos) / mantenimientos.length;
};

export const contarPorEstado = <T extends { estado: string }>(
  items: T[],
  estado: string
): number => {
  return items.filter((item) => item.estado === estado).length;
};