
import React from 'react';
import DashboardEquipo from '../../components/ui/Administrativa/EquipoBomberil/DashboardEquipo';

export default function AdminEquipoPage() {
  return (
    <div className="min-h-screen w-full bg-[#f9fafb] pt-28 px-6 pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-red-800">Equipo bomberil</h1>
      </div>

      <DashboardEquipo />
    </div>
  );
}
