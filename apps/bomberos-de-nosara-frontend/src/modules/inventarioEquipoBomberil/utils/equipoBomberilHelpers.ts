

// utils/equipoBomberilHelpers.ts

import { 
  Wrench,
  Wind,
  Axe,
  Zap,
  Droplets,
  type LucideIcon 
} from 'lucide-react';
import { EstadoEquipo, TipoEquipo } from '../../../types/equipoBomberil.types';
import { EstadoMantenimiento } from '../../../types/mantenimientoEquipo.types';

// ==================== ICONOS DE EQUIPOS ====================

export const getEquipoIcon = (tipo: TipoEquipo): LucideIcon => {
  const iconMap: Record<TipoEquipo, LucideIcon> = {
    [TipoEquipo.MOTOGUADANA]: Wrench,
    [TipoEquipo.SOPLADORA]: Wind,
    [TipoEquipo.TRONZADORA]: Axe,
    [TipoEquipo.MOTOSIERRA]: Zap,
    [TipoEquipo.BOMBA_AGUA]: Droplets,
  };

  return iconMap[tipo] || Wrench;
};

// ==================== COLORES DE ESTADO ====================

export const getEstadoEquipoColor = (estado: EstadoEquipo): string => {
  const colorMap: Record<EstadoEquipo, string> = {
    [EstadoEquipo.EN_SERVICIO]: 'text-green-600 bg-green-50 border-green-200',
    [EstadoEquipo.MALO]: 'text-orange-600 bg-orange-50 border-orange-200',
    [EstadoEquipo.FUERA_DE_SERVICIO]: 'text-red-600 bg-red-50 border-red-200',
    [EstadoEquipo.BAJA]: 'text-gray-600 bg-gray-50 border-gray-200',
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

export const getEstadoEquipoLabel = (estado: EstadoEquipo): string => {
  const labelMap: Record<EstadoEquipo, string> = {
    [EstadoEquipo.EN_SERVICIO]: 'En servicio',
    [EstadoEquipo.MALO]: 'Malo',
    [EstadoEquipo.FUERA_DE_SERVICIO]: 'Fuera de servicio',
    [EstadoEquipo.BAJA]: 'Dado de baja',
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

export const getTipoEquipoLabel = (tipo: TipoEquipo): string => {
  const labelMap: Record<TipoEquipo, string> = {
    [TipoEquipo.MOTOGUADANA]: 'Motoguadaña',
    [TipoEquipo.SOPLADORA]: 'Sopladora',
    [TipoEquipo.TRONZADORA]: 'Tronzadora',
    [TipoEquipo.MOTOSIERRA]: 'Motosierra',
    [TipoEquipo.BOMBA_AGUA]: 'Bomba de Agua',
  };

  return labelMap[tipo] || tipo;
};

// ==================== FORMATEO DE DATOS ====================

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

export const TIPO_EQUIPO_OPTIONS = [
  { value: TipoEquipo.MOTOGUADANA, label: 'Motoguadaña' },
  { value: TipoEquipo.SOPLADORA, label: 'Sopladora' },
  { value: TipoEquipo.TRONZADORA, label: 'Tronzadora' },
  { value: TipoEquipo.MOTOSIERRA, label: 'Motosierra' },
  { value: TipoEquipo.BOMBA_AGUA, label: 'Bomba de Agua' },
];

export const ESTADO_EQUIPO_OPTIONS = [
  { value: EstadoEquipo.EN_SERVICIO, label: 'En servicio' },
  { value: EstadoEquipo.MALO, label: 'Malo' },
  { value: EstadoEquipo.FUERA_DE_SERVICIO, label: 'Fuera de servicio' },
  { value: EstadoEquipo.BAJA, label: 'Dado de baja' },
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