export enum RoleEnum {
  SUPERUSER = 'SUPERUSER',
  ADMIN = 'ADMIN',
  PERSONAL_BOMBERIL = 'PERSONAL_BOMBERIL',
  VOLUNTARIO = 'VOLUNTARIO',
}

export const RoleLabels: Record<RoleEnum, string> = {
  [RoleEnum.SUPERUSER]: 'Superusuario',
  [RoleEnum.ADMIN]: 'Administrador',
  [RoleEnum.PERSONAL_BOMBERIL]: 'Personal Bomberil',
  [RoleEnum.VOLUNTARIO]: 'Voluntario',
};

export const getRoleLabel = (role: RoleEnum): string => {
  return RoleLabels[role] || role;
};
