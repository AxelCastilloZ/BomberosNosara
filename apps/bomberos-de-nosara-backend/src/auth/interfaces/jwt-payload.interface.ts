import { RoleEnum } from '../../roles/role.enum';

export interface JwtPayload {
  sub: number; 
  username: string;
  roles: RoleEnum[]; 
  iat?: number; 
  exp?: number; 
}
