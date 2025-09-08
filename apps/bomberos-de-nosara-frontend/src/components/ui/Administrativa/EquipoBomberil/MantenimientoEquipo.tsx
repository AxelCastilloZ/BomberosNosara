// src/components/ui/Administrativa/EquipoBomberil/MantenimientoEquipo.tsx
import React, { useState } from 'react';
import RecordMaintenanceEquipo from './RecordMaintenance';
import ScheduleMaintenanceEquipo from './ScheduleMaintenance';
import HistorialMantenimientoEquipo from './HistorialMantenimiento';
import { ClipboardList, CalendarClock, History } from 'lucide-react';

export default function MantenimientoEquipo({ onBack: _onBack }: { onBack: () => void }) {
  const [view, setView] = useState<'menu' | 'registrar' | 'programar' | 'historial'>('menu');

  if (view !== 'menu') {
    return (
      <div>
        {/* quitado el botón de volver aquí para evitar duplicado con el del Dashboard */}
        {view === 'registrar' && <RecordMaintenanceEquipo onClose={() => setView('menu')} />}
        {view === 'programar' && <ScheduleMaintenanceEquipo onClose={() => setView('menu')} />}
        {view === 'historial' && <HistorialMantenimientoEquipo onClose={() => setView('menu')} />}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-white border border-gray-200 shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-red-800">Mantenimiento de Equipo</h2>
        {/* quitado el botón de volver del header para no duplicar el del Dashboard */}
      </div>
      <p className="text-sm text-gray-600 mb-6">Selecciona una acción para continuar:</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          icon={<ClipboardList className="h-8 w-8 text-red-600" />}
          title="Registrar"
          desc="Añadir mantenimiento ya realizado"
          onClick={() => setView('registrar')}
        />
        <Card
          icon={<CalendarClock className="h-8 w-8 text-red-600" />}
          title="Programar"
          desc="Agendar próximo mantenimiento"
          onClick={() => setView('programar')}
        />
        <Card
          icon={<History className="h-8 w-8 text-red-600" />}
          title="Historial"
          desc="Ver registros anteriores"
          onClick={() => setView('historial')}
        />
      </div>
    </div>
  );
}

function Card({ icon, title, desc, onClick }: {
  icon: React.ReactNode; title: string; desc: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left cursor-pointer border rounded-lg p-6 hover:shadow-md hover:border-red-500 transition bg-white"
    >
      <div className="mb-2">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </button>
  );
}
