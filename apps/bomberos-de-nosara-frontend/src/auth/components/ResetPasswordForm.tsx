import { useState } from 'react';
import { resetPassword } from '../../service/auth';

type Props = {
  token: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

export default function ResetPasswordForm({ token, onSuccess, onError }: Props) {
  const [pwd1, setPwd1] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'Mínimo 8 caracteres';
    if (!/(?=.*[a-z])/.test(password)) return 'Falta una minúscula';
    if (!/(?=.*[A-Z])/.test(password)) return 'Falta una mayúscula';
    if (!/(?=.*\d)/.test(password)) return 'Falta un número';
    return null;
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const passwordError = validatePassword(pwd1);
    if (passwordError) return onError(passwordError);
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

  const getPasswordStrength = (password: string) => {
    const checks = [
      password.length >= 8,
      /(?=.*[a-z])/.test(password),
      /(?=.*[A-Z])/.test(password),
      /(?=.*\d)/.test(password),
    ];
    return checks.filter(Boolean).length;
  };

  const strength = getPasswordStrength(pwd1);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Nueva contraseña</label>
        <input
          type="password"
          placeholder="********"
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
          value={pwd1}
          onChange={(e) => setPwd1(e.target.value)}
          onFocus={() => setShowHints(true)}
          onBlur={() => setShowHints(false)}
          required
        />
        
        {/* Indicador de fuerza visual */}
        {pwd1.length > 0 && (
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-2 flex-1 rounded ${
                  strength >= level ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Hints cortos solo al enfocar */}
        {showHints && pwd1.length > 0 && strength < 4 && (
          <p className="text-xs text-gray-500 mt-1">
            8+ chars, A-Z, a-z, 0-9
          </p>
        )}
      </div>

      <div>
        <label className="block mb-1 font-medium">Repite la contraseña</label>
        <input
          type="password"
          placeholder="********"
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
          value={pwd2}
          onChange={(e) => setPwd2(e.target.value)}
          required
        />
        {pwd2.length > 0 && pwd1 !== pwd2 && (
          <p className="text-red-600 text-sm mt-1">No coinciden</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-2 rounded transition-colors"
      >
        {loading ? 'Guardando…' : 'Cambiar contraseña'}
      </button>
    </form>
  );
}