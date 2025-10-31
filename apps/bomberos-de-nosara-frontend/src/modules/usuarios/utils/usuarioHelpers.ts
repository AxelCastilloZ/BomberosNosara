

import { ROLE_LABELS } from '../../../constants/roles';
import type { User, RoleName } from '../../../types/user.types';

/**
 * Obtiene las etiquetas de los roles de un usuario como string
 * @example getRoleLabels(user.roles) => "Admin, Personal Bomberil"
 */
export const getRoleLabels = (roles: { name: string }[]): string => {
  return roles
    .map((r) => ROLE_LABELS[r.name as RoleName] || r.name)
    .join(', ');
};

/**
 * Formatea el nombre completo del usuario
 * Si no tiene nombre/apellido, retorna el username
 */
export const formatUserFullName = (user: User): string => {
  if (user.nombre && user.apellido) {
    return `${user.nombre} ${user.apellido}`;
  }
  if (user.nombre) {
    return user.nombre;
  }
  return user.username;
};

/**
 * Obtiene las iniciales del usuario
 * @example getUserInitials(user) => "JD" (Juan Díaz) o "AD" (admin)
 */
export const getUserInitials = (user: User): string => {
  if (user.nombre && user.apellido) {
    return `${user.nombre[0]}${user.apellido[0]}`.toUpperCase();
  }
  if (user.nombre) {
    return user.nombre.substring(0, 2).toUpperCase();
  }
  return user.username.substring(0, 2).toUpperCase();
};

/**
 * Valida si un email tiene formato válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida si un username cumple con los requisitos
 * - Mínimo 3 caracteres
 * - Solo letras, números, guiones y guiones bajos
 */
export const isValidUsername = (username: string): boolean => {
  if (username.length < 3) return false;
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  return usernameRegex.test(username);
};

/**
 * Valida si una contraseña cumple con los requisitos
 * - Mínimo 8 caracteres
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

/**
 * Obtiene el color del badge según el rol
 */
export const getRoleBadgeColor = (roleName: RoleName): string => {
  switch (roleName) {
    case 'SUPERUSER':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'ADMIN':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'PERSONAL_BOMBERIL':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'VOLUNTARIO':
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

/**
 * Filtra usuarios por texto de búsqueda
 * Busca en: username, email, nombre, apellido
 */
export const filterUsuariosBySearch = (
  usuarios: User[],
  searchText: string
): User[] => {
  if (!searchText.trim()) return usuarios;

  const search = searchText.toLowerCase();
  return usuarios.filter(
    (u) =>
      u.username.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      u.nombre?.toLowerCase().includes(search) ||
      u.apellido?.toLowerCase().includes(search)
  );
};

/**
 * Filtra usuarios por rol
 */
export const filterUsuariosByRole = (
  usuarios: User[],
  roleName: RoleName | 'Todos'
): User[] => {
  if (roleName === 'Todos') return usuarios;
  return usuarios.filter((u) => u.roles.some((r) => r.name === roleName));
};

/**
 * Ordena usuarios alfabéticamente por username
 */
export const sortUsuariosByUsername = (usuarios: User[]): User[] => {
  return [...usuarios].sort((a, b) => a.username.localeCompare(b.username));
};

/**
 * Verifica si un usuario tiene un rol específico
 */
export const hasRole = (user: User, roleName: RoleName): boolean => {
  return user.roles.some((r) => r.name === roleName);
};

/**
 * Verifica si un usuario es admin o superuser
 */
export const isUserAdmin = (user: User): boolean => {
  return hasRole(user, 'ADMIN') || hasRole(user, 'SUPERUSER');
};