import { useState } from 'react';
import { BarChart3, Users, ArrowLeft } from 'lucide-react';
import AdminParticipacionesFilt from '../../modules/voluntarios/components/toAdmin/AdminParticipacionesFilt';
import AdminVolEstadisticasSwitch from '../../modules/voluntarios/components/toAdmin/AdminVolEstadisticasSwitch';

type VoluntarioView = 'dashboard' | 'lista' | 'estadisticas';

export default function AdminVoluntariosPage() {
  const [viewMode, setViewMode] = useState<VoluntarioView>('dashboard');

  return (
    <div className="min-h-screen px-6 py-8 w-full bg-white pt-14">
      {viewMode !== 'dashboard' && (
        <button
          onClick={() => setViewMode('dashboard')}
          className="flex items-center gap-2 mb-1 text-red-700 hover:underline"
        >
          <ArrowLeft className="h-5 w-5" /> Volver
        </button>
      )}

      {/* Vista principal */}
      {viewMode === 'dashboard' && (
        <>
          <div className="flex items-center gap-4 mb-6">
            <Users className="h-8 w-8 text-red-700" />
            <div>
              <h1 className="text-3xl font-extrabold text-red-800">Gestión de Voluntarios</h1>
              <p className="text-gray-600 text-sm">
                Revisar participaciones, aprobar o rechazar registros y consultar estadísticas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setViewMode('lista')}
              className="bg-red-50 border border-red-200 p-4 rounded-lg hover:bg-red-100 text-center"
            >
              <Users className="h-6 w-6 mx-auto text-gray-600" />
              <h3 className="mt-2 font-semibold text-gray-800">Participaciones</h3>
              <p className="text-sm text-gray-600">Ver y gestionar participaciones de voluntarios</p>
            </button>

            <button
              onClick={() => setViewMode('estadisticas')}
              className="bg-red-50 border border-red-200 p-4 rounded-lg hover:bg-red-100 text-center"
            >
              <BarChart3 className="h-6 w-6 mx-auto text-gray-600" />
              <h3 className="mt-2 font-semibold text-gray-800">Estadísticas sobre Voluntarios</h3>
              <p className="text-sm text-gray-600">Ver estadísticas generales (próximamente)</p>
            </button>
          </div>
        </>
      )}

      {/* Lista de participaciones */}
      {viewMode === 'lista' && (
        <div className="bg-white  border-gray-200 shadow rounded-lg p-6 mt-6">
          <div className='mb-8'>
            <div className='flex items-center gap-2 mb-2 font-bold'>
              <h3>Bienvenido</h3>
            </div>
          <span>Gestiona aqui las participaciones, aprueba o rechaza los registros.</span>
          </div>
        
          <AdminParticipacionesFilt />
        </div>
      )}

      {/* Estadísticas */}
      {viewMode === 'estadisticas' && (
  <div className="bg-white border border-gray-200 shadow rounded-lg p-6 mt-6">
    <AdminVolEstadisticasSwitch />
  </div>
)}
    </div>
  );
}