import { useState } from 'react';
import { resetPassword } from '../../src/service/auth';

type Props = {
  token: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

export default function ResetPasswordForm({ token, onSuccess, onError }: Props) {
  const [pwd1, setPwd1] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pwd1.length < 8) return onError('La contraseña debe tener al menos 8 caracteres.');
    if (pwd1 !== pwd2) return onError('Las contraseñas no coinciden.');

    setLoading(true);
    try {
      await resetPassword(token, pwd1);
      onSuccess('Contraseña actualizada. Ya podés iniciar sesión.');
      
      setPwd1('');
      setPwd2('');
      
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo restablecer la contraseña.';
      onError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Nueva contraseña</label>
        <input
          type="password"
          placeholder="********"
          className="w-full border px-3 py-2 rounded"
          value={pwd1}
          onChange={(e) => setPwd1(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Repite la contraseña</label>
        <input
          type="password"
          placeholder="********"
          className="w-full border px-3 py-2 rounded"
          value={pwd2}
          onChange={(e) => setPwd2(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-2 rounded"
      >
        {loading ? 'Guardando…' : 'Cambiar contraseña'}
      </button>
    </form>
  );
}
