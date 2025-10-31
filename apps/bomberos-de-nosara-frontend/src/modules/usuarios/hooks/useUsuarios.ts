

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  checkUnique,
} from '../services/usuariosService';
import type { User } from '../../../types/user.types';
import type { CreateUsuarioDto, UpdateUsuarioDto, ApiFieldError } from '../types';
import { isValidEmail } from '../utils/usuarioHelpers';

// ============================================================================
// Query Keys
// ============================================================================

export const USUARIOS_KEY = ['usuarios'] as const;
const USUARIO_BY_ID_KEY = (id: number) => ['usuarios', id] as const;

// ============================================================================
// Types
// ============================================================================

type UpdatePayload = { id: number; data: UpdateUsuarioDto };
type UniqueField = 'email' | 'username';

// ============================================================================
// Hook Principal
// ============================================================================

export function useUsuarios() {
  const queryClient = useQueryClient();

  // Query: Lista de usuarios
  const {
    data: usuarios = [],
    isLoading,
    error,
    refetch,
  } = useQuery<User[]>({
    queryKey: USUARIOS_KEY,
    queryFn: getUsuarios,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Mutation: Crear usuario
  const createMutation = useMutation<User, ApiFieldError, CreateUsuarioDto>({
    mutationFn: createUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_KEY });
    },
  });

  // Mutation: Actualizar usuario
  const updateMutation = useMutation<User, ApiFieldError, UpdatePayload>({
    mutationFn: ({ id, data }) => updateUsuario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_KEY });
    },
  });

  // Mutation: Eliminar usuario
  const deleteMutation = useMutation<void, ApiFieldError, number>({
    mutationFn: deleteUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_KEY });
    },
  });

  // Función de validación única (para formularios en tiempo real)
  const validateUnique = useCallback(
    async (
      field: UniqueField,
      value: string,
      opts?: { currentValue?: string }
    ): Promise<boolean | 'skip'> => {
      const v = value?.trim();
      
      // No validar si está vacío
      if (!v) return 'skip';
      
      // No validar si es el mismo valor actual (en edición)
      if (opts?.currentValue && opts.currentValue.trim() === v) return 'skip';
      
      // Validaciones de formato antes de consultar al servidor
      if (field === 'username' && v.length < 3) return 'skip';
      if (field === 'email' && !isValidEmail(v)) return 'skip';
      
      try {
        const unique = await checkUnique(field, v);
        return unique ? true : false;
      } catch {
        return 'skip';
      }
    },
    []
  );

  return {
    // Data
    usuarios,
    isLoading,
    error: error as Error | null,
    
    // Actions
    refetch,
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
    validateUnique,
  };
}

// ============================================================================
// Hook: Usuario por ID
// ============================================================================

/**
 * Hook para obtener un usuario específico por ID
 * Útil para detalles de usuario o auditoría
 */
export function useUsuarioById(id?: number) {
  return useQuery<User>({
    queryKey: id ? USUARIO_BY_ID_KEY(id) : ['usuarios', 'disabled'],
    queryFn: () => getUsuarioById(id as number),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 30, // 30 minutos
    retry: 1,
  });
}