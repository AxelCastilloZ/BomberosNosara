// src/components/ui/ProfileButton/UserButton.tsx
import { FC, useRef, useEffect, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import UserButtonItems from './UserButtonItems';
import { useRouter } from '@tanstack/react-router';
import { useAuth } from '../../../hooks/useAuth';         // 👈 usa el hook unificado
import type { AuthUser } from '../../../service/auth';

// Obtiene un nombre "mostrable" desde el AuthUser
function getDisplayName(user: AuthUser | null): string {
  if (!user) return '';
  // prioriza name → username → parte local del email
  return (
    (user.name ?? user.username ?? (user.email ? user.email.split('@')[0] : '') ?? '') + ''
  );
}

// Saca iniciales de un string de forma segura
function getInitialsFrom(name: string): string {
  const n = (name || '').trim();
  if (!n) return '';
  const [a, b] = n.split(/\s+/);
  return ((a?.[0] ?? '') + (b?.[0] ?? '')).toUpperCase();
}

const UserButton: FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Del hook unificado: user (AuthUser|null), flag y logout()
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const toggle = () => setOpen(v => !v);
  const onLogin = () => {
    setOpen(false);
    router.navigate({ to: '/login' });
  };
  const onLogout = () => {
    logout();
    setOpen(false);
    router.navigate({ to: '/' });
  };

  const displayName = getDisplayName(user);
  const initials = getInitialsFrom(displayName);

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className="inline-flex items-center space-x-2 focus:outline-none">
        {isAuthenticated ? (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white font-semibold">
            {initials || 'U'}
          </div>
        ) : (
          <FaUserCircle size={32} className="text-gray-700 hover:text-black" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
          {isAuthenticated && (
            <div className="px-4 py-2 border-b text-gray-700 font-medium">
              {displayName || 'Usuario'}
            </div>
          )}

          {!isAuthenticated ? (
            <UserButtonItems label="Iniciar sesión" onClick={onLogin} />
          ) : (
            <>
              <UserButtonItems label="Vista administrativa" to="/admin" />
              <UserButtonItems label="Configuración" to="/settings" />
              <hr className="my-1" />
              <UserButtonItems label="Cerrar sesión" onClick={onLogout} isDanger />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserButton;
