import React, { useState } from 'react';
import { ClipboardList, CalendarClock, History } from 'lucide-react';
import type { MantenimientoVehiculoProps } from '../types';
import RecordMaintenance from './recordMaintenance';
import ScheduleMaintenance from './scheduleMaintenance';
import HistorialMantenimientos from './HistorialMantenimiento';

export default function MantenimientoVehiculo({ onBack }: MantenimientoVehiculoProps) {
  const [subView, setSubView] = useState<'inicio' | 'registrar' | 'programar' | 'historial'>('inicio');

  const volver = () => setSubView('inicio');

  if (subView === 'registrar') {
    return <RecordMaintenance onClose={volver} />;
  }

  if (subView === 'programar') {
    return <ScheduleMaintenance onClose={volver} />;
  }

  if (subView === 'historial') {
    return <HistorialMantenimientos onClose={volver} />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Mantenimiento de Vehículos</h2>
        <p className="text-gray-500">Selecciona una acción para continuar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <button
          onClick={() => setSubView('registrar')}
          className="bg-white rounded-2xl p-10 hover:shadow-xl transition-all duration-300 group border border-gray-100"
        >
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-100 transition-colors">
            <ClipboardList className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Registrar</h3>
          <p className="text-sm text-gray-500">Añadir mantenimiento realizado</p>
        </button>

        <button
          onClick={() => setSubView('programar')}
          className="bg-white rounded-2xl p-10 hover:shadow-xl transition-all duration-300 group border border-gray-100"
        >
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-100 transition-colors">
            <CalendarClock className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Programar</h3>
          <p className="text-sm text-gray-500">Agendar próximo mantenimiento</p>
        </button>

        <button
          onClick={() => setSubView('historial')}
          className="bg-white rounded-2xl p-10 hover:shadow-xl transition-all duration-300 group border border-gray-100"
        >
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-100 transition-colors">
            <History className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Historial</h3>
          <p className="text-sm text-gray-500">Ver registros anteriores</p>
        </button>
      </div>
    </div>
  );
}
