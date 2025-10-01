

import type { Vehicle } from '../../../types/vehiculo.types';


export const OBS_MAX = 150;


export const getTodayISO = () => new Date().toISOString().slice(0, 10);


type TV = Vehicle['tipo'];
export const TIPO_OPTIONS: { value: TV; label: string }[] = [
  { value: 'camión sisterna', label: 'Camión Sisterna' },
  { value: 'carro ambulancia', label: 'Carro Ambulancia' },
  { value: 'pickup utilitario', label: 'Pickup Utilitario' },
  { value: 'moto', label: 'Moto' },
  { value: 'atv', label: 'ATV' },
  { value: 'jet ski', label: 'Jet Ski' },
  { value: 'lancha rescate', label: 'Lancha Rescate' },
  { value: 'dron reconocimiento', label: 'Dron Reconocimiento' },
];

// Opciones de estado actual
type EV = Vehicle['estadoActual'];
export const ESTADO_OPTIONS: { value: EV; label: string }[] = [
  { value: 'en servicio', label: 'En servicio' },
  { value: 'malo', label: 'Malo' },
  { value: 'fuera de servicio', label: 'Fuera de servicio' },
  { value: 'dado de baja', label: 'Dado de baja' },
];

// Opciones para filtros de tipo
export const TYPE_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: 'Camión Sisterna', value: 'camión sisterna' },
  { label: 'Carro Ambulancia', value: 'carro ambulancia' },
  { label: 'Pickup Utilitario', value: 'pickup utilitario' },
  { label: 'Moto', value: 'moto' },
  { label: 'ATV', value: 'atv' },
  { label: 'Jet Ski', value: 'jet ski' },
  { label: 'Lancha Rescate', value: 'lancha rescate' },
  { label: 'Dron Reconocimiento', value: 'dron reconocimiento' },
];

// Opciones para filtros de estado
export const STATUS_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: 'En servicio', value: 'en servicio' },
  { label: 'Malo', value: 'malo' },
  { label: 'Fuera de servicio', value: 'fuera de servicio' },
  { label: 'Dado de baja', value: 'dado de baja' },
];

// Colores para los estados
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'en servicio': return 'bg-emerald-500';
    case 'malo': return 'bg-amber-500';
    case 'fuera de servicio': return 'bg-orange-500';
    case 'dado de baja': return 'bg-red-500';
    default: return 'bg-slate-300';
  }
};

// Estados disponibles para UpdateStatus
export const ESTADOS_DISPONIBLES = [
  {
    estado: 'en servicio' as EV,
    titulo: 'En servicio',
    descripcion: 'Totalmente operable',
    color: 'border-green-500 hover:border-green-600',
    punto: 'bg-green-500',
  },
  {
    estado: 'malo' as EV,
    titulo: 'Malo',
    descripcion: 'Requiere mantenimiento inmediato',
    color: 'border-amber-500 hover:border-amber-600',
    punto: 'bg-amber-500',
  },
  {
    estado: 'fuera de servicio' as EV,
    titulo: 'Fuera de servicio',
    descripcion: 'En mantenimiento o inoperable',
    color: 'border-orange-500 hover:border-orange-600',
    punto: 'bg-orange-500',
  },
  {
    estado: 'dado de baja' as EV,
    titulo: 'Dado de baja',
    descripcion: 'Fuera de servicio permanente',
    color: 'border-gray-400 hover:border-gray-500',
    punto: 'bg-red-600',
  },
];