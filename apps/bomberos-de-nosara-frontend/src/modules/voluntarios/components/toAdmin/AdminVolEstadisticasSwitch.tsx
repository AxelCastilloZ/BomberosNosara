import { useState } from 'react';
import AdminEstadisticasMensuales from '../../../../modules/voluntarios/components/toAdmin/AdminEstadisticasMensuales';
import AdminEstadisticasVoluntarios from '../../../../modules/voluntarios/components/toAdmin/AdminEstadisticasVoluntarios';

export default function AdminVolEstadisticasSwitch() {
  const [modo, setModo] = useState<'absolutas' | 'mensuales'>('absolutas');

  return (
    <div>
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setModo('absolutas')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            modo === 'absolutas'
              ? 'bg-red-700 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Ver Estadísticas Absolutas
        </button>
        <button
          onClick={() => setModo('mensuales')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            modo === 'mensuales'
              ? 'bg-red-700 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Ver Estadísticas del Mes
        </button>
      </div>

      {modo === 'absolutas' ? (
        <AdminEstadisticasVoluntarios />
      ) : (
        <AdminEstadisticasMensuales />
      )}
    </div>
  );
}