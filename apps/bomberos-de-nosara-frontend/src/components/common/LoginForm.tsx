import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAdminAuth } from '../../auth/AdminAuthContext';

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState(''); // username o email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUserAndToken } = useAdminAuth(); // ← nombre correcto

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // el backend espera este campo
          usernameOrEmail: identifier.trim(),
          password,
        }),
      });

      if (!res.ok) {
        const msg = (await res.text()) || 'Credenciales inválidas';
        throw new Error(msg);
      }

      const data = await res.json();
      // si tu backend devuelve { access_token, user: { username, email, roles, id } }
      setUserAndToken(data.user?.username ?? identifier, data.access_token);

      navigate({ to: '/admin' });
    } catch (err: any) {
      setError(err?.message ?? 'Error desconocido al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <label className="block mb-1 font-medium">Usuario o email</label>
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
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
