import api from '../../../api/apiConfig';
import type { User } from '../../../types/user.types';
import type { CreateUsuarioDto, UpdateUsuarioDto, ApiFieldError } from '../types';

const BASE_URL = '/users';

/**
 * Obtener todos los usuarios
 */
export const getUsuarios = async (): Promise<User[]> => {
  const { data } = await api.get<User[]>(BASE_URL);
  return data;
};

/**
 * Obtener un usuario por ID
 */
export const getUsuarioById = async (id: number): Promise<User> => {
  const { data } = await api.get<User>(`${BASE_URL}/${id}`);
  return data;
};

/**
 * Crear un nuevo usuario
 */
export const createUsuario = async (dto: CreateUsuarioDto): Promise<User> => {
  try {
    const { data } = await api.post<User>(BASE_URL, dto);
    return data;
  } catch (error: any) {
    // Manejo de error de duplicado
    if (error.response?.status === 409) {
      const apiError: ApiFieldError = {
        code: 'DUPLICATE_KEY',
        field: error.response.data?.field || 'unknown',
        message: error.response.data?.message || 'Ya existe un registro con ese valor',
      };
      throw apiError;
    }
    throw error;
  }
};

/**
 * Actualizar un usuario existente
 */
export const updateUsuario = async (
  id: number,
  dto: UpdateUsuarioDto
): Promise<User> => {
  try {
    const { data } = await api.put<User>(`${BASE_URL}/${id}`, dto);
    return data;
  } catch (error: any) {
    // Manejo de error de duplicado
    if (error.response?.status === 409) {
      const apiError: ApiFieldError = {
        code: 'DUPLICATE_KEY',
        field: error.response.data?.field || 'unknown',
        message: error.response.data?.message || 'Ya existe un registro con ese valor',
      };
      throw apiError;
    }
    throw error;
  }
};

/**
 * Eliminar un usuario (Soft Delete)
 */
export const deleteUsuario = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};

/**
 * Restaurar un usuario desactivado
 */
export const restoreUsuario = async (id: number): Promise<User> => {
  const { data } = await api.post<User>(`${BASE_URL}/${id}/restore`);
  return data;
};

/**
 * Verificar si un campo es único (email o username)
 * Usado para validación en tiempo real en formularios
 */
export const checkUnique = async (
  field: 'email' | 'username',
  value: string
): Promise<boolean> => {
  try {
    const { data } = await api.get<{ unique: boolean }>(
      `${BASE_URL}/check-unique`,
      { params: { field, value } }
    );
    
    return data.unique === true;
  } catch (error: any) {
    console.warn('Error al verificar unicidad, asumiendo único:', error);
    
    if (error.response?.status === 404) {
      return true;
    }
    
    if (!error.response) {
      return true;
    }
    
    return true;
  }
};