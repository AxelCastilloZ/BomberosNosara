import {jwtDecode} from 'jwt-decode';

export function getUserRoles(): string[] {
  const token = localStorage.getItem('token');
  if (!token) return [];

  try {
    const decoded: any = jwtDecode(token);
    return decoded.roles || []; 
  } catch (err) {
    return [];
  }
}










export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('authUser'); 
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

export function isAdmin() {
  return !!localStorage.getItem('token');
}

export function isVoluntario() {
  return getUserRoles().includes('VOLUNTARIO');
}



export function isSuperUser(): boolean {
  const token = localStorage.getItem('token');
  if (!token) return false;

  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload?.roles?.includes('SUPERUSER');
}
