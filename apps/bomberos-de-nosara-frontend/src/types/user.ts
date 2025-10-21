// ==== Uniones y alias base (type) ====
export type RoleName = 'SUPERUSER' | 'ADMIN' | 'PERSONAL_BOMBERIL' | 'VOLUNTARIO';

// Errores normalizados del API
export type ApiFieldError = {
  code: 'DUPLICATE_KEY' | 'VALIDATION_ERROR' | 'UNKNOWN';
  message: string;
  field?: 'email' | 'username' | string;
};

// ==== Modelos de dominio (interface) ====
export interface Role {
  id: number;
  name: RoleName;
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: Role[];
  // agrega lo que tengas en backend (createdAt, etc.)
}

// ==== DTOs (derivados con type) ====
export type CreateUserDto = {
  username: string;
  email: string;
  password: string;
  roles: RoleName[];
};

export type UpdateUserDto = {
  username?: string;
  email?: string;
  password?: string;
  roles?: RoleName[];
};

// Si usas filas específicas en la tabla (pero idealmente puede ser User):
export type UserRow = User;
