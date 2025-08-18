import { useState, useEffect } from 'react';

interface AuthState {
  token: string|null;
  isAuthenticated: boolean;
  user: any|null;
}

export const useAuth=() => {
  const [authState, setAuthState]=useState<AuthState>({
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    user: null,
  });

  useEffect(() => {
    const token=localStorage.getItem('token');
    if (token) {
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
      }));
    }
  }, []);

  const login=(token: string) => {
    localStorage.setItem('token', token);
    setAuthState({
      token,
      isAuthenticated: true,
      user: null,
    });
  };

  const logout=() => {
    localStorage.removeItem('token');
    setAuthState({
      token: null,
      isAuthenticated: false,
      user: null,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
};
