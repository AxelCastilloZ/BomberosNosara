import { RoleEnum } from '../../roles/role.enum';


export interface JwtPayload {
  sub: number;          
  email: string;
  roles?: RoleEnum[];
  iat?: number;
  exp?: number;
}
