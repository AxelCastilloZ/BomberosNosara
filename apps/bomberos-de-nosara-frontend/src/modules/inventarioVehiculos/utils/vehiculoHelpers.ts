// src/modules/inventarioVehiculos/utils/vehiculoHelpers.ts

import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Ban,
  HelpCircle 
} from 'lucide-react';
import type { EstadoVehiculo } from '../../../types/vehiculo.types';

// Función de normalización de strings
export const normalize = (s: string) =>
  (s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

// Función de capitalización
export function capitalize(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Formateo de etiquetas de estado para UI
export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    'en servicio': 'En servicio',
    'malo': 'Malo',
    'fuera de servicio': 'Fuera de servicio',
    'dado de baja': 'Dado de baja',
  };
  return map[status] || capitalize(status);
}

// Formateo de etiquetas de tipo para UI
export function formatTypeLabel(type: string): string {
  const map: Record<string, string> = {
    'camión sisterna': 'Camión Sisterna',
    'carro ambulancia': 'Carro Ambulancia',
    'pickup utilitario': 'Pickup Utilitario',
    'moto': 'Moto',
    'atv': 'ATV',
    'jet ski': 'Jet Ski',
    'lancha rescate': 'Lancha Rescate',
    'dron reconocimiento': 'Dron Reconocimiento',
  };
  return map[normalize(type)] || capitalize(type);
}

// Formateo de moneda costarricense
export function formatMoney(amount: number): string {
  try {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₡${amount}`;
  }
}

// Formateo corto de fecha ISO
export function shortDate(isoDate: string): string {
  const date = new Date(isoDate);
  return isNaN(date.getTime()) ? isoDate : date.toLocaleDateString('es-CR');
}

// Obtener color base para clases dinámicas de Tailwind
export function getEstadoColorBase(estado: EstadoVehiculo): string {
  switch (estado) {
    case 'en servicio': return 'emerald';
    case 'malo': return 'amber';
    case 'fuera de servicio': return 'orange';
    case 'dado de baja': return 'red';
    default: return 'gray';
  }
}

// Obtener icono del estado
export function getEstadoIcon(estado: EstadoVehiculo) {
  switch (estado) {
    case 'en servicio': return CheckCircle;
    case 'malo': return AlertTriangle;
    case 'fuera de servicio': return XCircle;
    case 'dado de baja': return Ban;
    default: return HelpCircle;
  }
}