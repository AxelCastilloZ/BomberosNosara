import { useState } from 'react';
import { requestPasswordReset } from '../../service/auth';

type Props = {
 
  onSent?: (message: string) => void;
  className?: string;
};

export default function ForgotPasswordForm({ onSent, className }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  const validateEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalErr(null);

    if (!validateEmail(email)) {
      setLocalErr('Ingresa un correo válido.');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      onSent?.('Si la cuenta existe, te enviamos un correo con instrucciones.');
    } catch {
      
      onSent?.('Si la cuenta existe, te enviamos un correo con instrucciones.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={className ?? 'space-y-4'}>
      <div>
        <label htmlFor="email" className="block mb-1 font-medium">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          className="w-full border px-3 py-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {localErr && <p className="text-red-600 text-sm mt-1">{localErr}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-2 rounded"
      >
        {loading ? 'Enviando…' : 'Enviar enlace'}
      </button>
    </form>
  );
}
