
import { ROLE_NAMES, RoleName, CreateUserDto, UpdateUserDto } from './user';


export type CreateUserForm = {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  roles: RoleName[];         
};

export type UpdateUserForm = {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;  
  roles?: RoleName[];
};


const trim = (s?: string) => (s ?? '').trim();

const filterValidRoles = (roles?: string[]): RoleName[] =>
  (roles ?? []).filter((r): r is RoleName => ROLE_NAMES.includes(r as RoleName));


export const toCreateUserDto = (f: CreateUserForm): CreateUserDto => ({
  username: trim(f.username),
  email: trim(f.email),
  password: f.password,          
  roles: filterValidRoles(f.roles),
});

export const toUpdateUserDto = (f: UpdateUserForm): UpdateUserDto => {
  const dto: UpdateUserDto = {};
  if (f.username && trim(f.username)) dto.username = trim(f.username);
  if (f.email && trim(f.email)) dto.email = trim(f.email);
  if (f.password && f.password.length >= 8) dto.password = f.password;
  if (f.roles) dto.roles = filterValidRoles(f.roles);
  return dto;
};
