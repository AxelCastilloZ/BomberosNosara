
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { useAdminAuth } from '../auth/AdminAuthContext';


export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAdminAuth(); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
     
      await login(username.trim(), password);
      navigate({ to: '/admin' });
    } catch (err: any) {
      setError(err?.message ?? 'Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <label className="block mb-1 font-medium">Usuario</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
          required
        />

        <label className="block mb-1 font-medium">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-6"
          required
        />

        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded">
          Iniciar sesión
        </button>

        <button
          type="button"
          onClick={() => navigate({ to: '/forgot-password' })}
          className="w-full text-sm text-blue-600 hover:underline mt-3"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </form>
    </div>
  );
}
