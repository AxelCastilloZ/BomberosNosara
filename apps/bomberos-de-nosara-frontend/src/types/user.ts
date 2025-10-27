// ==== Enums ====
export enum RoleEnum {
  SUPERUSER = 'SUPERUSER',
  ADMIN = 'ADMIN',
  PERSONAL_BOMBERIL = 'PERSONAL_BOMBERIL',
  VOLUNTARIO = 'VOLUNTARIO',
}

// Alias para nombres de roles como strings
export type RoleName = 'SUPERUSER' | 'ADMIN' | 'PERSONAL_BOMBERIL' | 'VOLUNTARIO';

// ==== Entidades de dominio ====
export interface Role {
  id: number;
  name: RoleEnum;
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: Role[];

  // 👇 Campos agregados según la API real del backend
  nombre?: string;
  apellido?: string;
  telefono?: string;
  estado?: string;

  // Campos opcionales de auditoría
  createdAt?: string;
  updatedAt?: string;
}

// ==== DTOs ====
export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  roles: string[]; // Array de nombres de roles como strings
  nombre?: string;
  apellido?: string;
  telefono?: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  roles?: string[];
  nombre?: string;
  apellido?: string;
  telefono?: string;
}

// ==== Errores del API ====
export interface ApiFieldError {
  code: 'DUPLICATE_KEY' | 'VALIDATION_ERROR' | 'UNKNOWN';
  message: string;
  field?: 'email' | 'username' | string;
}

// ==== Alias para compatibilidad ====
export type UserRow = User;
