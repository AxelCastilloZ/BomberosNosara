// src/auth/AdminAuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { clearAuth, getUserFromToken, isAuthenticated, setToken } from './auth';

interface AdminAuthContextType {
  user: string | null;
  setUserAndToken: (username: string, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  setUserAndToken: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      const u = getUserFromToken();
      setUser(u?.username ?? localStorage.getItem('authUser'));
    } else {
      setUser(null);
    }
  }, []);

  const setUserAndToken = (username: string, token: string) => {
    setToken(token);
    setUser(username);
    localStorage.setItem('authUser', username);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{ user, setUserAndToken, logout, isAuthenticated: isAuthenticated() }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
