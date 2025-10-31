

// src/modules/inventarioEquipos/hooks/useEquipos.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipoBomberilService } from '../services/equipoBomberilService';
import type {
  EquipoBomberil,
  CreateEquipoDto,
  EditEquipoDto,
  UpdateEstadoDto,
  PaginatedEquipoQueryDto,
  PaginatedEquipoResponseDto,
} from '../../../types/equipoBomberil.types';

// ==================== TYPES AUXILIARES ====================

interface DeleteResponse {
  message: string;
}

interface ExistsResponse {
  exists: boolean;
}

// ==================== QUERY KEYS ====================

const EQUIPOS_KEY = ['equipos'] as const;

// ==================== HOOKS DE CONSULTA - EQUIPOS ====================

/**
 * Hook para obtener todos los equipos sin paginación
 */
export const useEquipos = () => {
  return useQuery<EquipoBomberil[]>({
    queryKey: EQUIPOS_KEY,
    queryFn: () => equipoBomberilService.getAll(),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};

/**
 * Hook para obtener equipos con paginación y filtros
 */
export const useEquiposPaginated = (params: PaginatedEquipoQueryDto) => {
  return useQuery<PaginatedEquipoResponseDto>({
    queryKey: [...EQUIPOS_KEY, 'paginated', params],
    queryFn: () => equipoBomberilService.getAllPaginated(params),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};

/**
 * Hook para obtener equipos incluyendo los eliminados (soft delete)
 */
export const useEquiposWithDeleted = () => {
  return useQuery<EquipoBomberil[]>({
    queryKey: [...EQUIPOS_KEY, 'with-deleted'],
    queryFn: () => equipoBomberilService.getAllWithDeleted(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para obtener un equipo por ID
 */
export const useEquipo = (id?: string) => {
  return useQuery<EquipoBomberil>({
    queryKey: [...EQUIPOS_KEY, id],
    queryFn: () => equipoBomberilService.getOne(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para verificar si existe un equipo por número de serie
 */
export const useExistsByNumeroSerie = (numeroSerie?: string) => {
  return useQuery<ExistsResponse>({
    queryKey: ['equipos', 'numero-serie', numeroSerie],
    queryFn: () => equipoBomberilService.existsByNumeroSerie(numeroSerie as string),
    enabled: !!numeroSerie && numeroSerie.length >= 3,
    staleTime: 0, // No cachear para siempre validar en tiempo real
  });
};

// ==================== HOOKS DE MUTACIÓN - EQUIPOS ====================

/**
 * Hook para crear un nuevo equipo
 */
export const useAddEquipo = () => {
  const qc = useQueryClient();
  return useMutation<EquipoBomberil, any, CreateEquipoDto>({  
    mutationFn: (data: CreateEquipoDto) => equipoBomberilService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EQUIPOS_KEY });
    },
  });
};

/**
 * Hook para editar un equipo existente
 */
export const useUpdateEquipo = () => {
  const qc = useQueryClient();
  return useMutation<EquipoBomberil, Error, { id: string; data: EditEquipoDto }>({
    mutationFn: ({ id, data }) => equipoBomberilService.edit(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: EQUIPOS_KEY });
      qc.invalidateQueries({ queryKey: [...EQUIPOS_KEY, variables.id] });
    },
  });
};

/**
 * Hook para eliminar un equipo (soft delete)
 */
export const useDeleteEquipo = () => {
  const qc = useQueryClient();
  return useMutation<DeleteResponse, any, string>({  // 👈 Cambiar Error por any
    mutationFn: (id: string) => equipoBomberilService.softDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EQUIPOS_KEY });
    },
  });
};

/**
 * Hook para restaurar un equipo eliminado
 */
export const useRestoreEquipo = () => {
  const qc = useQueryClient();
  return useMutation<EquipoBomberil, Error, string>({
    mutationFn: (id: string) => equipoBomberilService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EQUIPOS_KEY });
    },
  });
};

/**
 * Hook para actualizar el estado de un equipo
 */
export const useUpdateEstadoEquipo = () => {
  const qc = useQueryClient();
  return useMutation<EquipoBomberil, Error, { id: string; data: UpdateEstadoDto }>({
    mutationFn: ({ id, data }) => equipoBomberilService.updateEstado(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: EQUIPOS_KEY });
      qc.invalidateQueries({ queryKey: [...EQUIPOS_KEY, variables.id] });
    },
  });
};

/**
 * Hook para dar de baja un equipo
 */
export const useDarDeBajaEquipo = () => {
  const qc = useQueryClient();
  return useMutation<EquipoBomberil, Error, { id: string; motivo: string }>({
    mutationFn: ({ id, motivo }) => equipoBomberilService.darDeBaja(id, motivo),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: EQUIPOS_KEY });
      qc.invalidateQueries({ queryKey: [...EQUIPOS_KEY, variables.id] });
    },
  });
};