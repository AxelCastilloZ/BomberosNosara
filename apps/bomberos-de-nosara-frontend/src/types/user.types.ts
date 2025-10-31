

// src/types/user.types.ts

// ============================================================================
// Enums
// ============================================================================

export enum RoleEnum {
  SUPERUSER = 'SUPERUSER',
  ADMIN = 'ADMIN',
  PERSONAL_BOMBERIL = 'PERSONAL_BOMBERIL',
  VOLUNTARIO = 'VOLUNTARIO',
}

// ============================================================================
// Type Aliases
// ============================================================================

export type RoleName = 'SUPERUSER' | 'ADMIN' | 'PERSONAL_BOMBERIL' | 'VOLUNTARIO';

// ============================================================================
// Entidades
// ============================================================================

export interface Role {
  id: number;
  name: RoleEnum;
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: Role[];
  nombre?: string;
  apellido?: string;
  telefono?: string;
  estado?: string;
  createdAt?: string;
  updatedAt?: string;
}