// src/modules/inventarioVehiculos/hooks/useReportes.ts

import { useQuery } from '@tanstack/react-query';
import { vehiculoService } from '../services/vehiculoService';
import type {
  ReporteCostosMensuales,
  ReporteCostosPorVehiculo,
} from '../../../types/mantenimiento.types';

// ==================== QUERY KEYS ====================

const COSTOS_MENSUALES_KEY = (mes: number, anio: number) => 
  ['reportes', 'costos-mensuales', mes, anio] as const;

const COSTOS_VEHICULO_KEY = (id: string, mes?: number, anio?: number) => 
  ['reportes', 'costos-vehiculo', id, mes, anio] as const;

// ==================== HOOKS DE CONSULTA - REPORTES ====================

/**
 * Hook para obtener el reporte de costos mensuales de mantenimientos
 */
export const useCostosMensuales = (mes: number, anio: number) => {
  return useQuery<ReporteCostosMensuales>({
    queryKey: COSTOS_MENSUALES_KEY(mes, anio),
    queryFn: () => vehiculoService.obtenerCostosMensuales(mes, anio),
    enabled: !!mes && !!anio,
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
};

/**
 * Hook para obtener el reporte de costos por vehículo específico
 */
export const useCostosPorVehiculo = (vehiculoId?: string, mes?: number, anio?: number) => {
  return useQuery<ReporteCostosPorVehiculo>({
    queryKey: vehiculoId ? COSTOS_VEHICULO_KEY(vehiculoId, mes, anio) : ['reportes', 'disabled'],
    queryFn: () => vehiculoService.obtenerCostosPorVehiculo(vehiculoId as string, mes, anio),
    enabled: !!vehiculoId,
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
};