
import { useEffect, useMemo, useState } from 'react';
import {
  getToken,
  setToken,
  clearAuth,
  getUserFromToken,
  getUserRoles,
  isAdmin as _isAdmin,
  isSuperUser as _isSuperUser,
  loginAndStore,
  type AuthUser,
} from '../service/auth';

type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  user: AuthUser | null;
  roles: string[];
};

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    const token = getToken();
    const user = getUserFromToken();        
    const roles = getUserRoles();
    return { token, isAuthenticated: !!token, user, roles };
  });

  const refresh = () => {
    const token = getToken();
    setState({
      token,
      isAuthenticated: !!token,
      user: getUserFromToken(),             
      roles: getUserRoles(),
    });
  };

  useEffect(() => {
    const onAuthChange = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === 'token' || e.key === 'authUser') refresh();
    };
    window.addEventListener('auth:token-changed', onAuthChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('auth:token-changed', onAuthChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const loginWithToken = (token: string) => {
    setToken(token);
    refresh();
  };

  const login = async (username: string, password: string) => {
    await loginAndStore(username, password);
    refresh();
  };

  const logout = () => {
    clearAuth();
    refresh();
  };

  const isAdmin = useMemo(() => _isAdmin(), [state.roles.join('|')]);
  const isSuperUser = useMemo(() => _isSuperUser(), [state.roles.join('|')]);

  return {
    ...state,
    isAdmin,
    isSuperUser,
    refresh,
    login,
    loginWithToken,
    logout,
  };
}
