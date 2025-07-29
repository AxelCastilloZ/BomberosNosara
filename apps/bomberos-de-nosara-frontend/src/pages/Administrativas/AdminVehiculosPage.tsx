import { useState } from 'react';
import DashboardVehiculo from '../../components/ui/Administrativa/Vehiculos/dashboardVehiculo';
import MantenimientoVehiculo from '../../components/ui/Administrativa/Vehiculos/MantenimientoVehiculo';
import {
  Truck, PlusCircle, Settings, ClipboardList, Wrench, ArrowLeft
} from 'lucide-react';
import { VehiculoView } from '../../types/vehiculos/vehiculoTypes';
import { Vehicle } from '../../interfaces/Vehiculos/vehicle';
import UpdateStatus from '../../components/ui/Administrativa/Vehiculos/updateStatus';
import ScheduleMaintenance from '../../components/ui/Administrativa/Vehiculos/scheduleMaintenance';
import RecordMaintenance from '../../components/ui/Administrativa/Vehiculos/recordMaintenance';
import AddVehiculo from '../../components/ui/Administrativa/Vehiculos/addVehiculo';

export default function AdminVehiculosPage() {
  const [viewMode, setViewMode] = useState<VehiculoView>('dashboard');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehicle | null>(null);

  return (
    <div className="min-h-screen px-6 py-8 w-full bg-[#f9fafb] pt-28">
      {viewMode !== 'dashboard' && (
        <button
          onClick={() => setViewMode('dashboard')}
          className="flex items-center gap-2 mb-4 text-red-700 hover:underline"
        >
          <ArrowLeft className="h-5 w-5" /> Volver
        </button>
      )}

      {/* Vista principal */}
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
            <button onClick={() => setViewMode('lista')} className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-100 text-center">
              <ClipboardList className="h-6 w-6 mx-auto text-gray-600" />
              <h3 className="mt-2 font-semibold text-gray-800">Lista de Vehículos</h3>
              <p className="text-sm text-gray-600">Ver todos los vehículos registrados</p>
            </button>

            <button onClick={() => setViewMode('agregar')} className="bg-red-50 border border-red-200 p-4 rounded-lg hover:bg-red-100 text-center">
              <PlusCircle className="h-6 w-6 mx-auto text-red-600" />
              <h3 className="mt-2 font-semibold text-red-700">Agregar Vehículo</h3>
              <p className="text-sm text-gray-600">Registrar nuevo vehículo</p>
            </button>

            <button onClick={() => setViewMode('estado')} className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-100 text-center">
              <Settings className="h-6 w-6 mx-auto text-gray-600" />
              <h3 className="mt-2 font-semibold text-gray-800">Actualizar Estado</h3>
              <p className="text-sm text-gray-600">Cambiar estado de vehículos</p>
            </button>

            <button onClick={() => setViewMode('mantenimiento')} className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-100 text-center">
              <Wrench className="h-6 w-6 mx-auto text-gray-600" />
              <h3 className="mt-2 font-semibold text-gray-800">Mantenimiento de Vehículos</h3>
              <p className="text-sm text-gray-600">Registrar, programar o ver historial</p>
            </button>
          </div>
        </>
      )}

      {/* Lista de vehículos */}
      {viewMode === 'lista' && (
        <div className="bg-white border border-gray-200 shadow rounded-lg p-6 mt-6">
          <DashboardVehiculo
            overrideModal={(vista, vehiculo) => {
              setVehiculoSeleccionado(vehiculo ?? null);
              setViewMode(vista);
            }}
          />
        </div>
      )}

      {/* Agregar vehículo */}
      {viewMode === 'agregar' && (
        <div className="bg-white border border-gray-200 shadow rounded-lg p-6 mt-6">
          <AddVehiculo onSuccess={() => setViewMode('dashboard')} />
        </div>
      )}

      {/* Actualizar estado */}
      {viewMode === 'estado' && (
        <UpdateStatus vehiculo={vehiculoSeleccionado ?? undefined} onClose={() => setViewMode('dashboard')} />
      )}

      {/* Programar mantenimiento */}
      {viewMode === 'programar' && (
        <ScheduleMaintenance vehiculoId={vehiculoSeleccionado?.id} onClose={() => setViewMode('dashboard')} />
      )}

      {/* Registrar mantenimiento */}
      {viewMode === 'registrar' && (
        <RecordMaintenance vehiculoId={vehiculoSeleccionado?.id} onClose={() => setViewMode('dashboard')} />
      )}

      {/* Vista unificada de mantenimiento */}
      {viewMode === 'mantenimiento' && (
        <div className="bg-white border border-gray-200 shadow rounded-lg p-6 mt-6">
          <MantenimientoVehiculo onBack={() => setViewMode('dashboard')} />
        </div>
      )}
    </div>
  );
}
