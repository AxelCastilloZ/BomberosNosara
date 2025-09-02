
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAdminAuth } from '../AdminAuthContext'; 

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAdminAuth();   

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      
      await login(identifier.trim(), password);
      navigate({ to: '/admin' });
    } catch (err: any) {
      setError(err?.message ?? 'Credenciales inválidas');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {}
      <input
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">Iniciar sesión</button>
    </form>
  );
}
