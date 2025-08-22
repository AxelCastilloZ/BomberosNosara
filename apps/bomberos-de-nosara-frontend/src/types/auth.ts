

export type LoginResponse = { access_token: string };

export type JwtPayload = {
  sub: number;
  username: string;
  roles: string[];   
  iat?: number;
  exp?: number;
};
