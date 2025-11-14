import { useNavigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import Logo from '../images/Logo1.png';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username.trim(), password);
      navigate({ to: '/admin' });
    } catch (err: any) {
      // Extraer mensaje del error de forma robusta
      const errorMessage = (err instanceof Error && err.message) 
        ? err.message 
        : 'Credenciales inválidas';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Patrón decorativo muy sutil de fondo */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Grid pattern ultra sutil */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(100, 100, 100, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(100, 100, 100, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-md">
        
        {/* Logo clickeable arriba del card */}
        <Link to="/" className="flex justify-center mb-8 group">
          <div className="bg-white rounded-full p-5 shadow-xl shadow-gray-300/50 group-hover:shadow-2xl group-hover:shadow-red-200/50 transition-all duration-300 group-hover:scale-105 ring-4 ring-white/50">
            <img 
              src={Logo} 
              alt="Bomberos de Nosara" 
              className="h-16 w-16 object-contain"
            />
          </div>
        </Link>

        {/* Card principal con degradado sutil en borde */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-gray-400/20 p-8 sm:p-10 relative overflow-hidden border border-gray-200">
          
          {/* Degradado decorativo superior */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
          
          {/* Título con degradado sutil */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
              Panel de Administración
            </h1>
            <p className="text-gray-600 text-sm font-medium">
              Bomberos de Nosara
            </p>
          </div>

          {/* Alerta de error */}
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-r flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Campo Usuario */}
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-2">
                Usuario
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all outline-none bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md"
                  placeholder="Ingresa tu usuario"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all outline-none bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Botón Login con degradado */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-700 hover:via-red-700 hover:to-red-800 active:from-red-800 active:to-red-900 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-600/40 hover:scale-[1.02] mt-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>

            {/* Link recuperar contraseña */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => navigate({ to: '/forgot-password' })}
                className="text-sm text-red-600 hover:text-red-700 hover:underline font-semibold transition-colors"
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6 font-medium">
          © {new Date().getFullYear()} Bomberos de Nosara
        </p>
      </div>
    </div>
  );
}