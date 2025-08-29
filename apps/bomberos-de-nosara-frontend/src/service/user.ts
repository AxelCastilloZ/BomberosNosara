import api from '../api/apiConfig';
import axios from 'axios';
import { User, CreateUserDto, UpdateUserDto } from '../types/user';

function toApiError(error: unknown, fallback = 'Error de usuarios') {
  if (axios.isAxiosError(error)) {
    const data: any = error.response?.data;
    return new Error(data?.message || data?.error || fallback);
  }
  return new Error(fallback);
}

export async function getUsers(): Promise<User[]> {
  try {
    const { data } = await api.get<User[]>('/users');
    return data;
  } catch (err) {
    throw toApiError(err, 'No se pudieron cargar los usuarios');
  }
}

export async function createUser(dto: CreateUserDto): Promise<User> {
  try {
    const { data } = await api.post<User>('/users', dto);
    return data;
  } catch (err) {
    throw toApiError(err, 'No se pudo crear el usuario');
  }
}

export async function updateUser(id: number, dto: UpdateUserDto): Promise<User> {
  try {
    const { data } = await api.put<User>(`/users/${id}`, dto);
    return data;
  } catch (err) {
    throw toApiError(err, 'No se pudo actualizar el usuario');
  }
}

export async function deleteUser(id: number): Promise<void> {
  try {
    await api.delete(`/users/${id}`);
  } catch (err) {
    throw toApiError(err, 'No se pudo eliminar el usuario');
  }
}
