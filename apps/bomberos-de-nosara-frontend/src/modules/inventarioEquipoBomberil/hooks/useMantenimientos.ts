

// src/modules/inventarioEquipos/hooks/useMantenimientos.ts

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipoBomberilService } from '../services/equipoBomberilService';
import type {
  MantenimientoEquipo,
  ProgramarMantenimientoDto,
  RegistrarMantenimientoDto,
  CompletarMantenimientoDto,
  EstadoMantenimiento,
} from '../../../types/mantenimientoEquipo.types';
import type { MantenimientoFiltersLocal } from '../types';

// ==================== TYPES AUXILIARES ====================

interface DeleteResponse {
  message: string;
}

// ==================== QUERY KEYS ====================

const HISTORIAL_KEY = (id: string) => ['equipos', id, 'historial'] as const;
const PROXIMO_MANTENIMIENTO_KEY = (id: string) => ['equipos', id, 'proximo-mantenimiento'] as const;
const MANTENIMIENTOS_PENDIENTES_KEY = ['mantenimientos', 'pendientes'] as const;
const MANTENIMIENTOS_DEL_DIA_KEY = ['mantenimientos', 'del-dia'] as const;
const TODOS_MANTENIMIENTOS_KEY = ['mantenimientos', 'todos'] as const;

// ==================== HOOKS DE CONSULTA - MANTENIMIENTOS ====================

/**
 * Hook para obtener el historial completo de mantenimientos de un equipo
 */
export const useHistorialEquipo = (id?: string) => {
  return useQuery<MantenimientoEquipo[]>({
    queryKey: id ? HISTORIAL_KEY(id) : ['equipos', 'historial', 'disabled'],
    queryFn: () => equipoBomberilService.obtenerHistorial(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para obtener el próximo mantenimiento programado de un equipo
 */
export const useProximoMantenimiento = (id?: string) => {
  return useQuery<MantenimientoEquipo | null>({
    queryKey: id ? PROXIMO_MANTENIMIENTO_KEY(id) : ['equipos', 'proximo', 'disabled'],
    queryFn: () => equipoBomberilService.obtenerProximoMantenimiento(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para obtener todos los mantenimientos pendientes
 */
export const useMantenimientosPendientes = () => {
  return useQuery<MantenimientoEquipo[]>({
    queryKey: MANTENIMIENTOS_PENDIENTES_KEY,
    queryFn: () => equipoBomberilService.obtenerMantenimientosPendientes(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para obtener los mantenimientos programados para hoy
 */
export const useMantenimientosDelDia = () => {
  return useQuery<MantenimientoEquipo[]>({
    queryKey: MANTENIMIENTOS_DEL_DIA_KEY,
    queryFn: () => equipoBomberilService.obtenerMantenimientosDelDia(),
    staleTime: 1000 * 60 * 2, // 2 minutos (más fresco)
  });
};

/**
 * Hook para obtener todos los mantenimientos (sin filtros)
 */
export const useTodosMantenimientos = () => {
  return useQuery<MantenimientoEquipo[]>({
    queryKey: TODOS_MANTENIMIENTOS_KEY,
    queryFn: () => equipoBomberilService.obtenerTodosMantenimientos(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

// ==================== HOOKS DE MUTACIÓN - MANTENIMIENTOS ====================

/**
 * Hook para programar un mantenimiento futuro
 */
export const useProgramarMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<MantenimientoEquipo, Error, { equipoId: string; data: ProgramarMantenimientoDto }>({
    mutationFn: ({ equipoId, data }) => equipoBomberilService.programarMantenimiento(equipoId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['equipos'] });
      qc.invalidateQueries({ queryKey: HISTORIAL_KEY(variables.equipoId) });
      qc.invalidateQueries({ queryKey: PROXIMO_MANTENIMIENTO_KEY(variables.equipoId) });
      qc.invalidateQueries({ queryKey: MANTENIMIENTOS_PENDIENTES_KEY });
      qc.invalidateQueries({ queryKey: TODOS_MANTENIMIENTOS_KEY });
    },
  });
};

/**
 * Hook para registrar un mantenimiento ya realizado
 */
export const useRegistrarMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<MantenimientoEquipo, Error, { equipoId: string; data: RegistrarMantenimientoDto }>({
    mutationFn: ({ equipoId, data }) => equipoBomberilService.registrarMantenimiento(equipoId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['equipos'] });
      qc.invalidateQueries({ queryKey: HISTORIAL_KEY(variables.equipoId) });
      qc.invalidateQueries({ queryKey: TODOS_MANTENIMIENTOS_KEY });
      // Invalida reportes de costos porque se agregó uno completado
      qc.invalidateQueries({ queryKey: ['reportes'] });
    },
  });
};

/**
 * Hook para completar un mantenimiento pendiente
 */
export const useCompletarMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<MantenimientoEquipo, Error, { mantenimientoId: string; data: CompletarMantenimientoDto; equipoId?: string }>({
    mutationFn: ({ mantenimientoId, data }) => equipoBomberilService.completarMantenimiento(mantenimientoId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['equipos'] });
      qc.invalidateQueries({ queryKey: MANTENIMIENTOS_PENDIENTES_KEY });
      qc.invalidateQueries({ queryKey: MANTENIMIENTOS_DEL_DIA_KEY });
      qc.invalidateQueries({ queryKey: TODOS_MANTENIMIENTOS_KEY });
      if (variables.equipoId) {
        qc.invalidateQueries({ queryKey: HISTORIAL_KEY(variables.equipoId) });
        qc.invalidateQueries({ queryKey: PROXIMO_MANTENIMIENTO_KEY(variables.equipoId) });
      }
      // Invalida reportes de costos
      qc.invalidateQueries({ queryKey: ['reportes'] });
    },
  });
};

/**
 * Hook para cambiar el estado de un mantenimiento
 */
export const useCambiarEstadoMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<MantenimientoEquipo, Error, { mantenimientoId: string; estado: EstadoMantenimiento; equipoId?: string }>({
    mutationFn: ({ mantenimientoId, estado }) => equipoBomberilService.cambiarEstadoMantenimiento(mantenimientoId, estado),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: MANTENIMIENTOS_PENDIENTES_KEY });
      qc.invalidateQueries({ queryKey: MANTENIMIENTOS_DEL_DIA_KEY });
      qc.invalidateQueries({ queryKey: TODOS_MANTENIMIENTOS_KEY });
      if (variables.equipoId) {
        qc.invalidateQueries({ queryKey: HISTORIAL_KEY(variables.equipoId) });
        qc.invalidateQueries({ queryKey: PROXIMO_MANTENIMIENTO_KEY(variables.equipoId) });
      }
    },
  });
};

/**
 * Hook para eliminar un mantenimiento (soft delete)
 */
export const useDeleteMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<DeleteResponse, Error, { id: string; equipoId?: string }>({
    mutationFn: ({ id }) => equipoBomberilService.softDeleteMantenimiento(id),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: TODOS_MANTENIMIENTOS_KEY });
      qc.invalidateQueries({ queryKey: MANTENIMIENTOS_PENDIENTES_KEY });
      if (variables.equipoId) {
        qc.invalidateQueries({ queryKey: HISTORIAL_KEY(variables.equipoId) });
      }
    },
  });
};

/**
 * Hook para restaurar un mantenimiento eliminado
 */
export const useRestoreMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<MantenimientoEquipo, Error, { id: string; equipoId?: string }>({
    mutationFn: ({ id }) => equipoBomberilService.restoreMantenimiento(id),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: TODOS_MANTENIMIENTOS_KEY });
      if (variables.equipoId) {
        qc.invalidateQueries({ queryKey: HISTORIAL_KEY(variables.equipoId) });
      }
    },
  });
};

// ==================== HOOK DE FILTROS - MANTENIMIENTOS ====================

/**
 * Hook personalizado para filtrar mantenimientos en el cliente
 * Útil para el componente HistorialMantenimientos (TabPorPeriodo)
 */
export const useMantenimientosFilters = () => {
  const [filters, setFilters] = useState<MantenimientoFiltersLocal>({});
  
  // Obtener todos los mantenimientos desde el backend
  const { data: todosMantenimientos, isLoading } = useTodosMantenimientos();
  
  // Filtrar mantenimientos en el cliente según los filtros activos
  const mantenimientosFiltrados = useMemo(() => {
    if (!todosMantenimientos) return [];
    
    return todosMantenimientos.filter(m => {
      // Filtro por fecha inicio
      if (filters.fechaInicio) {
        const fechaMantenimiento = new Date(m.fecha);
        const fechaInicio = new Date(filters.fechaInicio);
        fechaMantenimiento.setHours(0, 0, 0, 0);
        fechaInicio.setHours(0, 0, 0, 0);
        
        if (fechaMantenimiento < fechaInicio) {
          return false;
        }
      }
      
      // Filtro por fecha fin
      if (filters.fechaFin) {
        const fechaMantenimiento = new Date(m.fecha);
        const fechaFin = new Date(filters.fechaFin);
        fechaMantenimiento.setHours(0, 0, 0, 0);
        fechaFin.setHours(0, 0, 0, 0);
        
        if (fechaMantenimiento > fechaFin) {
          return false;
        }
      }
      
      // Filtro por estado
      if (filters.estado && m.estado !== filters.estado) {
        return false;
      }
      
      // Filtro por tipo
      if (filters.tipo && m.tipo !== filters.tipo) {
        return false;
      }
      
      // Filtro por equipo
      if (filters.equipoId && m.equipoId !== filters.equipoId) {
        return false;
      }
      
      return true;
    });
  }, [todosMantenimientos, filters]);
  
  /**
   * Actualizar un filtro específico
   */
  const updateFilter = <K extends keyof MantenimientoFiltersLocal>(
    key: K,
    value: MantenimientoFiltersLocal[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  /**
   * Limpiar todos los filtros
   */
  const clearFilters = () => {
    setFilters({});
  };
  
  /**
   * Verificar si hay filtros activos
   */
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.fechaInicio ||
      filters.fechaFin ||
      filters.estado ||
      filters.tipo ||
      filters.equipoId
    );
  }, [filters]);
  
  return {
    // Datos filtrados
    mantenimientos: mantenimientosFiltrados,
    isLoading,
    
    // Estado de filtros
    filters,
    hasActiveFilters,
    
    // Acciones
    setFilters,
    updateFilter,
    clearFilters,
  };
};