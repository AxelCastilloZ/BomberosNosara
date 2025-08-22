import React, { useState } from 'react';
import RecordMaintenance from './recordMaintenance';
import ScheduleMaintenance from './scheduleMaintenance';
import HistorialMantenimientos from './HistorialMantenimiento';
import { ClipboardList, CalendarClock, History } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export default function MantenimientoVehiculo({ onBack }: Props) {
  const [subView, setSubView] = useState<'inicio' | 'registrar' | 'programar' | 'historial'>('inicio');

  const volver = () => setSubView('inicio');

  return (
    <div className="max-w-5xl mx-auto bg-white border border-gray-200 shadow rounded-lg p-6">
      {subView === 'inicio' && (
        <>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Mantenimiento de Vehículos</h2>
          <p className="text-sm text-gray-600 mb-6">Selecciona una acción para continuar:</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setSubView('registrar')}
              className="cursor-pointer border rounded-lg p-6 hover:shadow-md hover:border-red-500 transition"
            >
              <ClipboardList className="h-8 w-8 text-red-600 mb-2" />
              <h3 className="text-lg font-semibold text-gray-800">Registrar</h3>
              <p className="text-sm text-gray-600">Añadir mantenimiento ya realizado</p>
            </div>

            <div
              onClick={() => setSubView('programar')}
              className="cursor-pointer border rounded-lg p-6 hover:shadow-md hover:border-red-500 transition"
            >
              <CalendarClock className="h-8 w-8 text-red-600 mb-2" />
              <h3 className="text-lg font-semibold text-gray-800">Programar</h3>
              <p className="text-sm text-gray-600">Agendar próximo mantenimiento</p>
            </div>

            <div
              onClick={() => setSubView('historial')}
              className="cursor-pointer border rounded-lg p-6 hover:shadow-md hover:border-red-500 transition"
            >
              <History className="h-8 w-8 text-red-600 mb-2" />
              <h3 className="text-lg font-semibold text-gray-800">Historial</h3>
              <p className="text-sm text-gray-600">Ver registros anteriores</p>
            </div>
          </div>
        </>
      )}

      {subView !== 'inicio' && (
        <button onClick={volver} className="mt-4 text-sm text-blue-600 hover:underline mb-4">
          ← Volver al menú de mantenimiento
        </button>
      )}

      {subView === 'registrar' && <RecordMaintenance onClose={volver} />}
      {subView === 'programar' && <ScheduleMaintenance onClose={volver} />}
      {subView === 'historial' && <HistorialMantenimientos onClose={volver} />}
    </div>
  );
}
