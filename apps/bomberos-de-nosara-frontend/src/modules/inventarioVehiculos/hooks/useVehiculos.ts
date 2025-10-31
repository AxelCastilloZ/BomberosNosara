// src/modules/inventarioVehiculos/hooks/useVehiculos.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiculoService } from '../services/vehiculoService';
import type {
  Vehiculo,
  CreateVehiculoDto,
  EditVehiculoDto,
  UpdateEstadoDto,
  PaginatedVehiculoQueryDto,
  PaginatedVehiculoResponseDto,
} from '../../../types/vehiculo.types';

// ==================== TYPES AUXILIARES ====================

interface DeleteResponse {
  message: string;
}

interface ExistsResponse {
  exists: boolean;
}

// ==================== QUERY KEYS ====================

const VEHICULOS_KEY = ['vehiculos'] as const;

// ==================== HOOKS DE CONSULTA - VEHÍCULOS ====================

/**
 * Hook para obtener todos los vehículos sin paginación
 */
export const useVehiculos = () => {
  return useQuery<Vehiculo[]>({
    queryKey: VEHICULOS_KEY,
    queryFn: () => vehiculoService.getAll(),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};

/**
 * Hook para obtener vehículos con paginación y filtros
 */
export const useVehiculosPaginated = (params: PaginatedVehiculoQueryDto) => {
  return useQuery<PaginatedVehiculoResponseDto>({
    queryKey: [...VEHICULOS_KEY, 'paginated', params],
    queryFn: () => vehiculoService.getAllPaginated(params),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};

/**
 * Hook para obtener vehículos incluyendo los eliminados (soft delete)
 */
export const useVehiculosWithDeleted = () => {
  return useQuery<Vehiculo[]>({
    queryKey: [...VEHICULOS_KEY, 'with-deleted'],
    queryFn: () => vehiculoService.getAllWithDeleted(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para obtener un vehículo por ID
 */
export const useVehiculo = (id?: string) => {
  return useQuery<Vehiculo>({
    queryKey: [...VEHICULOS_KEY, id],
    queryFn: () => vehiculoService.getOne(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para verificar si existe un vehículo por placa
 */
export const useExistsByPlaca = (placa?: string) => {
  return useQuery<ExistsResponse>({
    queryKey: ['vehiculos', 'placa', placa],
    queryFn: () => vehiculoService.existsByPlaca(placa as string),
    enabled: !!placa && placa.length >= 3,
    staleTime: 0, // No cachear para siempre validar en tiempo real
  });
};

// ==================== HOOKS DE MUTACIÓN - VEHÍCULOS ====================

/**
 * Hook para crear un nuevo vehículo
 */
export const useAddVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehiculo, Error, CreateVehiculoDto>({
    mutationFn: (data: CreateVehiculoDto) => vehiculoService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
    },
  });
};

/**
 * Hook para editar un vehículo existente
 */
export const useUpdateVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehiculo, Error, { id: string; data: EditVehiculoDto }>({
    mutationFn: ({ id, data }) => vehiculoService.edit(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
      qc.invalidateQueries({ queryKey: [...VEHICULOS_KEY, variables.id] });
    },
  });
};

/**
 * Hook para eliminar un vehículo (soft delete)
 */
export const useDeleteVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<DeleteResponse, any, string>({
    //                              ^^^ Cambio de Error a any
    mutationFn: (id: string) => vehiculoService.softDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
    },
  });
};

/**
 * Hook para restaurar un vehículo eliminado
 */
export const useRestoreVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehiculo, Error, string>({
    mutationFn: (id: string) => vehiculoService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
    },
  });
};

/**
 * Hook para actualizar el estado de un vehículo
 */
export const useUpdateEstadoVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehiculo, Error, { id: string; data: UpdateEstadoDto }>({
    mutationFn: ({ id, data }) => vehiculoService.updateEstado(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
      qc.invalidateQueries({ queryKey: [...VEHICULOS_KEY, variables.id] });
    },
  });
};

/**
 * Hook para dar de baja un vehículo
 */
export const useDarDeBajaVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehiculo, Error, { id: string; motivo: string }>({
    mutationFn: ({ id, motivo }) => vehiculoService.darDeBaja(id, motivo),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
      qc.invalidateQueries({ queryKey: [...VEHICULOS_KEY, variables.id] });
    },
  });
};