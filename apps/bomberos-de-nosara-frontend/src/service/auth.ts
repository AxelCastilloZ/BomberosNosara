import api from '../api/apiConfig';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { RoleEnum } from '../types/role.enum'; 

export type LoginResponse = {
  access_token: string;
  user?: { id?: number; username?: string; email?: string; roles?: RoleEnum[] };
};

export type AuthUser = {
  id?: string | number;
  email?: string;
  name?: string;
  roles?: RoleEnum[];
  [k: string]: any;
};

const TOKEN_KEY = 'access_token';
const LEGACY_TOKEN_KEY = 'token';

function toApiError(error: unknown, fallback = 'Error de autenticación') {
  if (axios.isAxiosError(error)) {
    const data: any = error.response?.data;
    return new Error(data?.message || data?.error || fallback);
  }
  return new Error(fallback);
}

/* =========================
   Login / Reset
   ========================= */
export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    const { data } = await api.post<LoginResponse>('/auth/login', { username, password });
    return data;
  } catch (err) {
    throw toApiError(err, 'Credenciales inválidas');
  }
}

export async function loginAndStore(username: string, password: string): Promise<LoginResponse> {
  const data = await login(username, password);
  setToken(data.access_token);
  return data;
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  try {
    const { data } = await api.post('/auth/request-password-reset', { email });
    return data as { message: string };
  } catch {
    return { message: 'Si la cuenta existe, te enviamos un correo con instrucciones.' };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  try {
    const { data } = await api.post('/auth/reset-password', { token, newPassword });
    return data as { message: string };
  } catch (err) {
    throw toApiError(err, 'No se pudo restablecer la contraseña');
  }
}

/* =========================
   Tokens y Auth
   ========================= */
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(LEGACY_TOKEN_KEY, token);

  const user = getUserFromToken(token);
  if (user) localStorage.setItem('authUser', JSON.stringify(user));

  window.dispatchEvent(new Event('auth:token-changed'));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem('authUser');
  window.dispatchEvent(new Event('auth:token-changed'));
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

/* =========================
   Decodificación de usuario
   ========================= */
export function getUserFromToken(token?: string): AuthUser | null {
  const t = token ?? getToken();
  if (!t) return null;

  try {
    const decoded: any = jwtDecode(t);

    // Normalizamos roles -> siempre RoleEnum[]
    const rawRoles: string[] | undefined = decoded?.roles ?? (decoded?.role ? [decoded.role] : undefined);
    const roles: RoleEnum[] = (rawRoles ?? [])
      .map((r) => r.replace(/^ROLE_/, '').toUpperCase())
      .filter((r): r is RoleEnum => Object.values(RoleEnum).includes(r as RoleEnum));

    return {
      id: decoded?.sub ?? decoded?.id,
      email: decoded?.email,
      name: decoded?.name ?? decoded?.username,
      roles,
      ...decoded,
    };
  } catch {
    return null;
  }
}

/* =========================
   Roles Helpers
   ========================= */
export function getUserRoles(): RoleEnum[] {
  return getUserFromToken()?.roles ?? [];
}

export function isAdmin(): boolean {
  const roles = getUserRoles();
  return roles.includes(RoleEnum.ADMIN) || roles.includes(RoleEnum.SUPERUSER);
}

export function isSuperUser(): boolean {
  return getUserRoles().includes(RoleEnum.SUPERUSER);
}

export function logout() {
  clearAuth();
}
