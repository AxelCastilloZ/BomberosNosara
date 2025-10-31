

// src/modules/inventarioEquipos/hooks/useReportes.ts

import { useQuery } from '@tanstack/react-query';
import { equipoBomberilService } from '../services/equipoBomberilService';
import type {
  ReporteCostosMensuales,
  ReporteCostosPorEquipo,
} from '../../../types/mantenimientoEquipo.types';

// ==================== QUERY KEYS ====================

const COSTOS_MENSUALES_KEY = (mes: number, anio: number) => 
  ['reportes', 'costos-mensuales', mes, anio] as const;

const COSTOS_EQUIPO_KEY = (id: string, mes?: number, anio?: number) => 
  ['reportes', 'costos-equipo', id, mes, anio] as const;

// ==================== HOOKS DE CONSULTA - REPORTES ====================

/**
 * Hook para obtener el reporte de costos mensuales de mantenimientos
 */
export const useCostosMensuales = (mes: number, anio: number) => {
  return useQuery<ReporteCostosMensuales>({
    queryKey: COSTOS_MENSUALES_KEY(mes, anio),
    queryFn: () => equipoBomberilService.obtenerCostosMensuales(mes, anio),
    enabled: !!mes && !!anio,
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
};

/**
 * Hook para obtener el reporte de costos por equipo específico
 */
export const useCostosPorEquipo = (equipoId?: string, mes?: number, anio?: number) => {
  return useQuery<ReporteCostosPorEquipo>({
    queryKey: equipoId ? COSTOS_EQUIPO_KEY(equipoId, mes, anio) : ['reportes', 'disabled'],
    queryFn: () => equipoBomberilService.obtenerCostosPorEquipo(equipoId as string, mes, anio),
    enabled: !!equipoId,
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
};