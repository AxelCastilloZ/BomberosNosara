import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getUsers, 
  getUserById,
  createUser, 
  updateUser, 
  deleteUser, 
  checkUnique 
} from '../../service/user';
import type { User, CreateUserDto, UpdateUserDto, ApiFieldError } from '../../types/user';

export const USERS_KEY = ['users'] as const;
const USER_BY_ID_KEY = (id: number) => ['users', id] as const;

type EditPayload = { id: number; data: UpdateUserDto };
type UniqueField = 'email' | 'username';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function useUsers() {
  const qc = useQueryClient();

  const list = useQuery<User[]>({
    queryKey: USERS_KEY,
    queryFn: getUsers,
    staleTime: 1000 * 60 * 5,
  });

  const create = useMutation<User, ApiFieldError, CreateUserDto>({
    mutationFn: createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });

  const edit = useMutation<User, ApiFieldError, EditPayload>({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });

  const remove = useMutation<void, ApiFieldError, number>({
    mutationFn: deleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });

  /** true => es único, false => duplicado, 'skip' => no evaluar/indefinido */
  const validateUnique = useCallback(
    async (
      field: UniqueField,
      value: string,
      opts?: { currentValue?: string }
    ): Promise<boolean | 'skip'> => {
      const v = value?.trim();
      if (!v) return 'skip';
      if (opts?.currentValue && opts.currentValue.trim() === v) return 'skip';
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
    users: list.data ?? [],
    isLoading: list.isLoading,
    error: list.error as Error | null,
    refetch: list.refetch,
    create,
    edit,
    remove,
    validateUnique,
  };
}

/**
 * Hook para obtener un usuario por ID
 * Usado principalmente para auditoría y mostrar nombres de usuarios
 */
export function useUserById(id?: number) {
  return useQuery<User>({
    queryKey: id ? USER_BY_ID_KEY(id) : ['users', 'disabled'],
    queryFn: () => getUserById(id as number),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 30, // 30 minutos
    retry: 1,
  });
}