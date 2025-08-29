// src/auth/auth.ts
import { jwtDecode } from 'jwt-decode';

export type AuthUser = {
  id?: string;
  email?: string;
  name?: string;
  roles?: string[];
  [k: string]: any;
};

export function setToken(token: string) {
  localStorage.setItem('token', token);
  const user = getUserFromToken(token);
  if (user) localStorage.setItem('authUser', JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('authUser');
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

export function getUserFromToken(token?: string): AuthUser | null {
  const t = token ?? localStorage.getItem('token');
  if (!t) return null;

  try {
    const decoded: any = jwtDecode(t);
    const roles: string[] | undefined =
      decoded?.roles ??
      (decoded?.role ? [decoded.role] : undefined);

    const user: AuthUser = {
      id: decoded?.sub ?? decoded?.id,
      email: decoded?.email,
      name: decoded?.name ?? decoded?.username,
      roles,
      ...decoded, // por si quieres acceder a más claims
    };
    return user;
  } catch {
    return null;
  }
}

export function getUserRoles(): string[] {
  const t = localStorage.getItem('token');
  if (!t) return [];
  try {
    const decoded: any = jwtDecode(t);
    return decoded?.roles ?? [];
  } catch {
    return [];
  }
}

export function isAdmin(): boolean {
  const roles = getUserRoles();
  return roles.includes('ADMIN') || roles.includes('SUPERUSER');
}

export function isSuperUser(): boolean {
  const roles = getUserRoles();
  return roles.includes('SUPERUSER');
}

export function logout() {
  clearAuth();
}
