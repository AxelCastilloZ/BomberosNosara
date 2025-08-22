
import { jwtDecode } from 'jwt-decode';

export type JwtPayload = {
  sub: number;
  username: string;
  roles: string[];
  email?: string;
  iat?: number;
  exp?: number;
};

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('authUser');
}

export function isAuthenticated(): boolean {
  const t = getToken();
  if (!t) return false;
  try {
    const dec = jwtDecode<JwtPayload>(t);
    return !!dec?.sub && (!dec.exp || dec.exp * 1000 > Date.now());
  } catch {
    return false;
  }
}

export function getUserFromToken(): { username: string; roles: string[]; email?: string } | null {
  const t = getToken();
  if (!t) return null;
  try {
    const dec = jwtDecode<JwtPayload>(t);
    return { username: dec.username, roles: dec.roles || [], email: dec.email };
  } catch {
    return null;
  }
}

export function hasRole(role: string): boolean {
  const u = getUserFromToken();
  return !!u?.roles?.includes(role);
}

export function isSuperUser(): boolean {
  return hasRole('SUPERUSER');
}

export function getUserRoles(): string[] {
  const u = getUserFromToken();
  return u?.roles ?? [];
}
