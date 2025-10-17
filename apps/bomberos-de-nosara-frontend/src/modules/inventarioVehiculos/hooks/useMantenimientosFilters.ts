// src/modules/inventarioVehiculos/hooks/useMantenimientosFilters.ts

import { useState, useMemo } from 'react';
import { useTodosMantenimientos } from './useVehiculos';
import type { Mantenimiento } from '../../../types/mantenimiento.types';
import type { MantenimientoFiltersLocal } from '../types';

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
      
      // Filtro por vehículo
      if (filters.vehiculoId && m.vehiculoId !== filters.vehiculoId) {
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
      filters.vehiculoId
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