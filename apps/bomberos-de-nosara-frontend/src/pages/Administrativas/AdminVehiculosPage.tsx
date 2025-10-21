// src/pages/Administrativas/AdminVehiculosPage.tsx
import { useState } from 'react';
import {
  Truck, PlusCircle, Settings, ClipboardList, Wrench, ArrowLeft
} from 'lucide-react';
import { VehiculoView } from '../../types/vehiculos/vehiculoTypes';
import { Vehicle } from '../../interfaces/Vehiculos/vehicle';

// Componentes de vehículos
import DashboardVehiculo from '../../components/ui/Administrativa/Vehiculos/dashboardVehiculo';
import MantenimientoVehiculo from '../../components/ui/Administrativa/Vehiculos/MantenimientoVehiculo';
import UpdateStatus from '../../components/ui/Administrativa/Vehiculos/updateStatus';
import ScheduleMaintenance from '../../components/ui/Administrativa/Vehiculos/scheduleMaintenance';
import RecordMaintenance from '../../components/ui/Administrativa/Vehiculos/recordMaintenance';
import AddVehiculo from '../../components/ui/Administrativa/Vehiculos/addVehiculo';

export default function AdminVehiculosPage() {
  const [viewMode, setViewMode] = useState<VehiculoView>('dashboard');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehicle | null>(null);

  return (
    <div className="min-h-screen px-6 py-8 w-full bg-[#f9fafb]">
      {/* Botón de volver - solo se muestra cuando no estamos en dashboard */}
      {viewMode !== 'dashboard' && (
        <button
          onClick={() => setViewMode('dashboard')}
          className="flex items-center gap-2 mb-4 text-red-700 hover:underline transition-colors"
        >
          <ArrowLeft className="h-5 w-5" /> Volver al Dashboard
        </button>
      )}

      {/* Vista principal - Dashboard */}
      {viewMode === 'dashboard' && (
        <>
          <div className="flex items-center gap-4 mb-6">
            <Truck className="h-8 w-8 text-red-700" />
            <div>
              <h1 className="text-3xl font-extrabold text-red-800">Gestión de Vehículos</h1>
              <p className="text-gray-600 text-sm">
                Sistema integral para la administración y mantenimiento de la flota vehicular de Bomberos de Nosara.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Lista de vehículos */}
            <button 
              onClick={() => setViewMode('lista')} 
              className="bg-white border border-gray-200 p-6 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all text-center group"
            >
              <ClipboardList className="h-8 w-8 mx-auto text-gray-600 group-hover:text-red-600 transition-colors" />
              <h3 className="mt-3 font-semibold text-gray-800 group-hover:text-red-700">Lista de Vehículos</h3>
              <p className="text-sm text-gray-600 mt-1">Ver todos los vehículos registrados</p>
            </button>

            {/* Agregar vehículo */}
            <button 
              onClick={() => setViewMode('agregar')} 
              className="bg-red-50 border border-red-200 p-6 rounded-lg hover:bg-red-100 hover:shadow-md transition-all text-center group"
            >
              <PlusCircle className="h-8 w-8 mx-auto text-red-600 group-hover:text-red-700 transition-colors" />
              <h3 className="mt-3 font-semibold text-red-700 group-hover:text-red-800">Agregar Vehículo</h3>
              <p className="text-sm text-red-600 mt-1">Registrar nuevo vehículo en la flota</p>
            </button>

            {/* Actualizar estado */}
            <button 
              onClick={() => setViewMode('estado')} 
              className="bg-white border border-gray-200 p-6 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all text-center group"
            >
              <Settings className="h-8 w-8 mx-auto text-gray-600 group-hover:text-red-600 transition-colors" />
              <h3 className="mt-3 font-semibold text-gray-800 group-hover:text-red-700">Actualizar Estado</h3>
              <p className="text-sm text-gray-600 mt-1">Cambiar estado operacional de vehículos</p>
            </button>

            {/* Mantenimiento */}
            <button 
              onClick={() => setViewMode('mantenimiento')} 
              className="bg-white border border-gray-200 p-6 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all text-center group"
            >
              <Wrench className="h-8 w-8 mx-auto text-gray-600 group-hover:text-red-600 transition-colors" />
              <h3 className="mt-3 font-semibold text-gray-800 group-hover:text-red-700">Mantenimiento</h3>
              <p className="text-sm text-gray-600 mt-1">Programar y registrar mantenimientos</p>
            </button>
          </div>
        </>
      )}

      {/* Vista de lista de vehículos */}
      {viewMode === 'lista' && (
        <div className="bg-white border border-gray-200 shadow rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Lista de Vehículos</h2>
            <p className="text-gray-600">Administra todos los vehículos de la flota</p>
          </div>
          <DashboardVehiculo
            overrideModal={(vista, vehiculo) => {
              setVehiculoSeleccionado(vehiculo ?? null);
              setViewMode(vista);
            }}
          />
        </div>
      )}

      {/* Vista de agregar vehículo */}
      {viewMode === 'agregar' && (
        <div className="bg-white border border-gray-200 shadow rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Agregar Nuevo Vehículo</h2>
            <p className="text-gray-600">Registra un nuevo vehículo en la flota de bomberos</p>
          </div>
          <AddVehiculo onSuccess={() => setViewMode('dashboard')} />
        </div>
      )}

      {/* Vista de actualizar estado */}
      {viewMode === 'estado' && (
        <div className="bg-white border border-gray-200 shadow rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Actualizar Estado de Vehículo</h2>
            <p className="text-gray-600">Modifica el estado operacional de los vehículos</p>
          </div>
          <UpdateStatus 
            vehiculo={vehiculoSeleccionado ?? undefined} 
            onClose={() => setViewMode('dashboard')} 
          />
        </div>
      )}

      {/* Vista de programar mantenimiento */}
      {viewMode === 'programar' && vehiculoSeleccionado && (
        <div className="bg-white border border-gray-200 shadow rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Programar Mantenimiento</h2>
            <p className="text-gray-600">Programa mantenimiento para {vehiculoSeleccionado.placa}</p>
          </div>
          <ScheduleMaintenance 
            vehiculoId={vehiculoSeleccionado.id} 
            onClose={() => setViewMode('dashboard')} 
          />
        </div>
      )}

      {/* Vista de registrar mantenimiento */}
      {viewMode === 'registrar' && vehiculoSeleccionado && (
        <div className="bg-white border border-gray-200 shadow rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Registrar Mantenimiento</h2>
            <p className="text-gray-600">Registra mantenimiento realizado para {vehiculoSeleccionado.placa}</p>
          </div>
          <RecordMaintenance 
            vehiculoId={vehiculoSeleccionado.id} 
            onClose={() => setViewMode('dashboard')} 
          />
        </div>
      )}

      {/* Vista unificada de mantenimiento */}
      {viewMode === 'mantenimiento' && (
        <div className="bg-white border border-gray-200 shadow rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Mantenimiento</h2>
            <p className="text-gray-600">Centro unificado para todas las operaciones de mantenimiento</p>
          </div>
          <MantenimientoVehiculo onBack={() => setViewMode('dashboard')} />
        </div>
      )}
    </div>
  );
}