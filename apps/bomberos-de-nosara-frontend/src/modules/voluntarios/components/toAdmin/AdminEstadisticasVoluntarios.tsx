// src/components/ui/Administrativa/Voluntarios/EstadisticasVoluntarios.tsx
import { useEstadisticasVolGenerales } from '../../Hooks/useVoluntarios';
import { BarChart3, Users, Clock, CheckCircle, ClipboardList } from 'lucide-react';
import { EstadisticasVoluntariosDto } from '../../types/voluntarios';
import ParticipacionesPieChart from '../charts/ParticipacionesPieChart';

export default function AdminEstadisticasVoluntarios() {
  const { data, isLoading } = useEstadisticasVolGenerales();

  if (isLoading) return <p className="text-gray-600">Cargando estadísticas...</p>;

  if (!data || data.voluntariosActivos === 0) {
    return (
      <div className="text-center py-10">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700">No hay estadísticas disponibles</h3>
        <p className="text-sm text-gray-500">Aún no hay registros de participaciones de voluntarios.</p>
      </div>
    );
  }

  const {
    totalHoras,
    voluntariosActivos,
    tasaAprobacion,
    topVoluntarios,
    participacionesPorTipo,
    totalParticipaciones,
  } = data as EstadisticasVoluntariosDto;

   const fmtHoras = (dec: number) => {
    const h = Math.floor(dec);
    const m = Math.round((dec - h) * 60);
    return `${h} h ${m} min`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-red-800 mb-6">Estadísticas Absolutas de Voluntarios</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <Clock className="h-8 w-8 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Total Horas</p>
            <p className="text-2xl font-bold">{fmtHoras(totalHoras)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <Users className="h-8 w-8 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Voluntarios Activos</p>
            <p className="text-2xl font-bold">{voluntariosActivos}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <ClipboardList className="h-8 w-8 text-purple-600" />
          <div>
            <p className="text-sm text-gray-600">Total Participaciones</p>
            <p className="text-2xl font-bold">{totalParticipaciones || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <div>
            <p className="text-sm text-gray-600">Tasa de Aprobación</p>
            <p className="text-2xl font-bold">{tasaAprobacion}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-gray-800 mb-2">Lista General</h3>
          <ul className="space-y-2">
            {topVoluntarios.map((v, index) => (
              <li key={index} className="flex justify-between">
                <span>{v.nombre}</span>
                <span className="font-semibold">{fmtHoras(v.horas)}</span>
              </li>
            ))}
          </ul>
        </div>

        <ParticipacionesPieChart participacionesPorTipo={participacionesPorTipo} />
      </div>
    </div>
  );
}