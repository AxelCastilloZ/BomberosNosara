// src/components/ui/Administrativa/Voluntarios/EstadisticasVoluntariosMensuales.tsx
import { useEstadisticasVolMensuales} from '../../Hooks/useVoluntarios';
import { BarChart3, Users, Clock, CheckCircle, ClipboardList } from 'lucide-react';
import { EstadisticasVoluntariosDto } from '../../types/voluntarios';
import { useState } from 'react';
import ParticipacionesPieChart from '../charts/ParticipacionesPieChart';
import TopVoluntariosBarChart from '../charts/TopVoluntariosBarChart';

export default function AdminEstadisticasMensuales() {
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));
  const { data, isLoading } = useEstadisticasVolMensuales(mes);

  const fmtHoras = (dec: number) => {
    const h = Math.floor(dec);
    const m = Math.round((dec - h) * 60);
    return `${h} h ${m} min`;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-red-800">Estadísticas Mensuales de Voluntarios</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="mes-selector" className="text-sm font-medium text-gray-700">
            Seleccionar mes:
          </label>
          <input
            id="mes-selector"
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-600">Cargando estadísticas mensuales...</p>
      ) : !data || data.voluntariosActivos === 0 ? (
        <div className="text-center py-10">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No hay estadísticas disponibles para este mes</h3>
          <p className="text-sm text-gray-500">Aún no hay registros de participaciones en el mes seleccionado.</p>
          <p className="text-sm text-gray-500 mt-2">Prueba seleccionando otro mes.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Horas Totales del Mes</p>
                <p className="text-2xl font-bold">{fmtHoras((data as EstadisticasVoluntariosDto).totalHoras)}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Voluntarios Activos del Mes</p>
                <p className="text-2xl font-bold">{(data as EstadisticasVoluntariosDto).voluntariosActivos}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
              <ClipboardList className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Participaciones del Mes</p>
                <p className="text-2xl font-bold">{(data as EstadisticasVoluntariosDto).totalParticipaciones || 0}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Tasa de Aprobación del mes</p>
                <p className="text-2xl font-bold">{(data as EstadisticasVoluntariosDto).tasaAprobacion}%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TopVoluntariosBarChart topVoluntarios={(data as EstadisticasVoluntariosDto).topVoluntarios} titulo="Top 5 Voluntarios" />

            <ParticipacionesPieChart participacionesPorTipo={(data as EstadisticasVoluntariosDto).participacionesPorTipo} />
          </div>
        </>
      )}
    </div>
  );
}