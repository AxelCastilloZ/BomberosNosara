// src/components/ui/Administrativa/Voluntarios/EstadisticasVoluntarios.tsx
import { BarChart3, Users, Clock, CheckCircle} from 'lucide-react';

const EstadisticasVoluntarios = () => {
  // Datos quemados
  const stats = {
    totalVoluntarios: 45,
    totalParticipaciones: 128,
    horasTotales: 312,
    aprobadas: 110,
    rechazadas: 8,
    pendientes: 10,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Estadísticas Generales de Voluntarios</h2>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg shadow border flex items-center gap-4">
          <Users className="h-10 w-10 text-blue-500" />
          <div>
            <p className="text-sm text-gray-600">Voluntarios Activos</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalVoluntarios}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border flex items-center gap-4">
          <BarChart3 className="h-10 w-10 text-green-500" />
          <div>
            <p className="text-sm text-gray-600">Participaciones Registradas</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalParticipaciones}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border flex items-center gap-4">
          <Clock className="h-10 w-10 text-orange-500" />
          <div>
            <p className="text-sm text-gray-600">Horas Totales</p>
            <p className="text-2xl font-bold text-gray-800">{stats.horasTotales} hrs</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border flex items-center gap-4">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
          <div>
            <p className="text-sm text-gray-600">Aprobadas</p>
            <p className="text-2xl font-bold text-gray-800">{stats.aprobadas}</p>
          </div>
        </div>
      </div>

      {/* Gráfico simulado */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de Participaciones</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-700 mb-1">
              <span>Aprobadas</span>
              <span>{stats.aprobadas}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full"
                style={{ width: `${(stats.aprobadas / stats.totalParticipaciones) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm text-gray-700 mb-1">
              <span>Rechazadas</span>
              <span>{stats.rechazadas}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-red-500 h-2.5 rounded-full"
                style={{ width: `${(stats.rechazadas / stats.totalParticipaciones) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm text-gray-700 mb-1">
              <span>Pendientes</span>
              <span>{stats.pendientes}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-yellow-500 h-2.5 rounded-full"
                style={{ width: `${(stats.pendientes / stats.totalParticipaciones) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasVoluntarios;