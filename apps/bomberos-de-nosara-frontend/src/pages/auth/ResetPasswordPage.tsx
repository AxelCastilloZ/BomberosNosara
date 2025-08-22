import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import ResetPasswordForm from '../../auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const token = useMemo(
    () => new URLSearchParams(window.location.search).get('token') ?? '',
    []
  );

  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const hasToken = Boolean(token);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Establecer nueva contraseña</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Define tu nueva contraseña para continuar.
        </p>

        {!hasToken && (
          <div className="p-2 bg-red-100 text-red-800 rounded mb-4 text-center">
            Token inválido o faltante. Verifica el enlace del correo.
          </div>
        )}

        {okMsg && (
          <div className="p-2 bg-green-100 text-green-800 rounded mb-4 text-center">
            {okMsg}
          </div>
        )}
        {errMsg && (
          <div className="p-2 bg-red-100 text-red-800 rounded mb-4 text-center">
            {errMsg}
          </div>
        )}

        {hasToken && (
          <ResetPasswordForm
            token={token}
            onSuccess={(msg) => {
              setErrMsg(null);
              setOkMsg(msg);
            }}
            onError={(msg) => {
              setOkMsg(null);
              setErrMsg(msg);
            }}
          />
        )}

        <button
          onClick={() => navigate({ to: '/login' })}
          className="mt-4 text-sm text-gray-600 hover:underline w-full"
        >
          Volver a iniciar sesión
        </button>
      </div>
    </div>
  );
}
