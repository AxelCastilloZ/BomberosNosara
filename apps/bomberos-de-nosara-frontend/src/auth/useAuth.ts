
import { useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode';

type JwtPayload = {
  sub: string;
  username: string;
  roles: string[];
};

export function useAuthRoles(): string[] {
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setRoles(decoded.roles || []);
      } catch (err) {
        console.error('Invalid token');
      }
    }
  }, []);

  return roles;
}
