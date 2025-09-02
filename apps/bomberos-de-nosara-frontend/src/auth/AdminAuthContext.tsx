
import { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { AuthUser } from '../service/auth';

type AdminAuthContextType = {
  user: AuthUser | null;
  roles: string[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => void;
  logout: () => void;
  refresh: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { user, roles, isAuthenticated, login, loginWithToken, logout, refresh } = useAuth();
  const value = { user, roles, isAuthenticated, login, loginWithToken, logout, refresh };
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
