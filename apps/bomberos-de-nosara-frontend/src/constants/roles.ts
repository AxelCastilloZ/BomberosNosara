import type { RoleName } from '../types/user';

export const ROLES = ['SUPERUSER', 'ADMIN', 'PERSONAL_BOMBERIL', 'VOLUNTARIO'] as const satisfies readonly RoleName[];

export const ROLE_LABELS: Record<RoleName, string> = {
  SUPERUSER: 'Superusuario',
  ADMIN: 'Administrador',
  PERSONAL_BOMBERIL: 'Personal Bomberil',
  VOLUNTARIO: 'Voluntario',
};
