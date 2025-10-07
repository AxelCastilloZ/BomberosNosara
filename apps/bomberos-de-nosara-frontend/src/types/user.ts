// src/types/user.ts

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
  // Campos opcionales de auditoría si los agregas después
  createdAt?: string;
  updatedAt?: string;
}

// ==== DTOs ====
export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  roles: string[]; // Array de nombres de roles como strings
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  roles?: string[]; // Array de nombres de roles como strings
}

// ==== Errores del API ====
export interface ApiFieldError {
  code: 'DUPLICATE_KEY' | 'VALIDATION_ERROR' | 'UNKNOWN';
  message: string;
  field?: 'email' | 'username' | string;
}

// ==== Alias para compatibilidad ====
export type UserRow = User;