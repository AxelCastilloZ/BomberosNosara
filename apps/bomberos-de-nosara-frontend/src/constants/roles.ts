
export const ROLES = ['SUPERUSER', 'ADMIN', 'PERSONAL_BOMBERIL', 'VOLUNTARIO'] as const;


export type RoleName = typeof ROLES[number];


export const ROLE_LABELS: Record<RoleName, string> = {
  SUPERUSER: 'Superusuario',
  ADMIN: 'Administrador',
  PERSONAL_BOMBERIL: 'Personal bomberil',
  VOLUNTARIO: 'Voluntario',
};


export function isRole(x: unknown): x is RoleName {
  return typeof x === 'string' && (ROLES as readonly string[]).includes(x);
}
