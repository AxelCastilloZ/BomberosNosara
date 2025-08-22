
export const ROLE_NAMES = ['SUPERUSER', 'ADMIN', 'PERSONAL_BOMBERIL', 'VOLUNTARIO'] as const;
export type RoleName = typeof ROLE_NAMES[number];

export interface Role { id: number; name: RoleName; }
export interface User { id: number; username: string; email?: string; roles: Role[]; }

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  roles: RoleName[];
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  roles?: RoleName[];
}
