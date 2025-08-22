import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import ForgotPasswordForm from '../../auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Recuperar contraseña</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Escribe tu correo y te enviaremos un enlace para restablecer la contraseña.
        </p>

        {message && (
          <div className="p-2 bg-green-100 text-green-800 rounded mb-4 text-center">
            {message}
          </div>
        )}

        <ForgotPasswordForm
          onSent={(msg) => setMessage(msg)}
        />

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
