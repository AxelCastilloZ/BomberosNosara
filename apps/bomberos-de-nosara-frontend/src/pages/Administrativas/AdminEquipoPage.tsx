// src/pages/AdminEquipoPage.tsx

import { useState } from 'react';
import EquipoForm from '../../components/ui/Administrativa/EquipoBomberil/EquipoForm';
import EquipoTable from '../../components/ui/Administrativa/EquipoBomberil/EquipoTable';
import { EquipoBomberil } from '../../interfaces/EquipoBomberil/equipoBomberil';

const AdminEquipoPage = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<EquipoBomberil | undefined>(undefined);

  const toggleFormulario = () => {
    setMostrarFormulario((prev) => !prev);
    setEquipoSeleccionado(undefined);
  };

  const handleExitoRegistro = () => {
    setMostrarFormulario(false);
    setEquipoSeleccionado(undefined);
  };

  const handleEditarEquipo = (equipo: EquipoBomberil) => {
    setEquipoSeleccionado(equipo);
    setMostrarFormulario(true);
  };

  return (
    <div className="min-h-screen px-6 py-8 w-full bg-[#f9fafb] pt-28">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-extrabold text-red-800">
          Administrar Equipos
        </h1>

        <button
          onClick={toggleFormulario}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-md shadow transition-all"
        >
          {mostrarFormulario ? 'Cancelar' : '+ Agregar equipo'}
        </button>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <div className="bg-white border border-gray-200 shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {equipoSeleccionado ? 'Editar equipo' : 'Registrar nuevo equipo'}
          </h2>
          <EquipoForm equipo={equipoSeleccionado} onSuccess={handleExitoRegistro} />
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white border border-gray-200 shadow rounded-lg p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          📋 Lista de equipos registrados
        </h2>
        <EquipoTable onEdit={handleEditarEquipo} />
      </div>
    </div>
  );
};

export default AdminEquipoPage;
