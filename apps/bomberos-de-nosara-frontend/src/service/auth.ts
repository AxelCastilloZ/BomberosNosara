import api from '../api/apiConfig';
import axios from 'axios';
import { LoginResponse } from '../types/auth';  // gracias al barrel puedes usar '@/types'

function toApiError(error: unknown, fallback = 'Error de autenticación') {
  if (axios.isAxiosError(error)) {
    const data: any = error.response?.data;
    return new Error(data?.message || data?.error || fallback);
  }
  return new Error(fallback);
}

export async function login(identifier: string, password: string): Promise<string> {
  try {
    const { data } = await api.post<LoginResponse>('/auth/login', {
      username: identifier,
      password,
    });
    return data.access_token;
  } catch (err) {
    throw toApiError(err, 'Credenciales inválidas');
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const { data } = await api.post('/auth/request-password-reset', { email });
    return data as { message: string };
  } catch {
    // Respuesta neutra para evitar enumeración
    return { message: 'Si la cuenta existe, te enviamos un correo con instrucciones.' };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const { data } = await api.post('/auth/reset-password', { token, newPassword });
    return data as { message: string };
  } catch (err) {
    throw toApiError(err, 'No se pudo restablecer la contraseña');
  }
}
