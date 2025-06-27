import { createContext, useContext, useEffect, useState } from 'react';

interface AdminAuthContextType {
  user: string | null;
  setUser: (user: string | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('authUser');
    if (token && storedUser) {
      setUserState(storedUser);
    } else {
      setUserState(null);
    }
  }, []);

  const setUser = (user: string | null) => {
    if (user) {
      setUserState(user);
      localStorage.setItem('authUser', user);
    } else {
      setUserState(null);
      localStorage.removeItem('authUser');
      localStorage.removeItem('token');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authUser');
    setUserState(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        isAuthenticated: !!user && !!localStorage.getItem('token'),
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('authUser');
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

export function isAdmin(): boolean {
  return !!localStorage.getItem('token');
}
