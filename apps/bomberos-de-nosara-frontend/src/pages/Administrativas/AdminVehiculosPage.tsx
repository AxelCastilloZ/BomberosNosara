// src/pages/Administrativas/AdminVehiculosPage.tsx
import { useState } from 'react';
import {
  Truck, 
  PlusCircle, 
  Settings, 
  ClipboardList, 
  Wrench, 
  ArrowLeft,
  Ambulance,
  Car,
  Bike,
} from 'lucide-react';

// Types
import type { VehiculoView } from '../../modules/inventarioVehiculos/types';
import type { Vehicle } from '../../types/vehiculo.types';

// Componentes del módulo
import VehiculoList from '../../modules/inventarioVehiculos/components/vehiculoList';
import MantenimientoVehiculo from '../../modules/inventarioVehiculos/components/MantenimientoVehiculo';
import UpdateStatus from '../../modules/inventarioVehiculos/components/updateStatus';
import ScheduleMaintenance from '../../modules/inventarioVehiculos/components/scheduleMaintenance';
import RecordMaintenance from '../../modules/inventarioVehiculos/components/recordMaintenance';
import AddVehiculo from '../../modules/inventarioVehiculos/components/addVehiculo';
import DetallesVehiculo from '../../modules/inventarioVehiculos/components/DetallesVehiculo';
import EditVehiculo from '../../modules/inventarioVehiculos/components/EditVehiculo';

// Hook
import { useVehiculos } from '../../modules/inventarioVehiculos/hooks/useVehiculos';

export default function AdminVehiculosPage() {
  const [viewMode, setViewMode] = useState<VehiculoView>('dashboard');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehicle | null>(null);

  const { data: vehicles = [] } = useVehiculos();

  const volverAlDashboard = () => {
    setVehiculoSeleccionado(null);
    setViewMode('dashboard');
  };

  const volverALista = () => {
    setVehiculoSeleccionado(null);
    setViewMode('lista');
  };

  // Helper para iconos de vehículos
  const getVehicleIcon = (type: string, className = 'h-5 w-5'): React.ReactNode => {
    const normalized = type.toLowerCase();
    
    if (normalized.includes('camión') || normalized.includes('sisterna')) 
      return <Truck className={className} />;
    if (normalized.includes('ambulancia')) 
      return <Ambulance className={className} />;
    if (normalized.includes('pickup')) 
      return <Car className={className} />;
    if (normalized.includes('moto')) 
      return <Bike className={className} />;
    
    return <Wrench className={className} />;
  };

  // Helper para colores de estado
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'en servicio': return 'bg-emerald-500';
      case 'malo': return 'bg-amber-500';
      case 'fuera de servicio': return 'bg-orange-500';
      case 'dado de baja': return 'bg-red-500';
      default: return 'bg-slate-300';
    }
  };

  const cambiarVista = (nuevaVista: VehiculoView, vehiculo?: Vehicle) => {
    if (vehiculo) {
      setVehiculoSeleccionado(vehiculo);
    }
    setViewMode(nuevaVista);
  };

  return (
    <div className="min-h-screen px-6 py-8 w-full bg-[#f9fafb]">
      {/* Botón de volver */}
      {viewMode !== 'dashboard' && (
        <button
          onClick={volverAlDashboard}
          className="flex items-center gap-2 mb-4 text-red-700 hover:underline transition-colors"
        >
          <ArrowLeft className="h-5 w-5" /> Volver al Dashboard
        </button>
      )}

      {/* Vista Dashboard Principal */}
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
            <button 
              onClick={() => setViewMode('lista')} 
              className="bg-white border border-gray-200 p-6 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all text-center group"
            >
              <ClipboardList className="h-8 w-8 mx-auto text-gray-600 group-hover:text-red-600 transition-colors" />
              <h3 className="mt-3 font-semibold text-gray-800 group-hover:text-red-700">Lista de Vehículos</h3>
              <p className="text-sm text-gray-600 mt-1">Ver todos los vehículos registrados</p>
            </button>

            <button 
              onClick={() => setViewMode('agregar')} 
              className="bg-red-50 border border-red-200 p-6 rounded-lg hover:bg-red-100 hover:shadow-md transition-all text-center group"
            >
              <PlusCircle className="h-8 w-8 mx-auto text-red-600 group-hover:text-red-700 transition-colors" />
              <h3 className="mt-3 font-semibold text-red-700 group-hover:text-red-800">Agregar Vehículo</h3>
              <p className="text-sm text-red-600 mt-1">Registrar nuevo vehículo en la flota</p>
            </button>

           

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

      {/* Vista Lista de Vehículos */}
      {viewMode === 'lista' && (
        <div className="bg-white border border-gray-300 shadow rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Lista de Vehículos</h2>
            <p className="text-gray-600">Administra todos los vehículos de la flota</p>
          </div>
          <VehiculoList
            vehicles={vehicles}
            onUpdateVehicle={() => {}}
            getVehicleIcon={getVehicleIcon}
            getStatusColor={getStatusColor}
            onEstado={(vehiculo) => cambiarVista('estado', vehiculo)}
            onVerDetalles={(vehiculo) => cambiarVista('detalles', vehiculo)}
            onEditar={(vehiculo) => cambiarVista('editar', vehiculo)}
          />
        </div>
      )}

      {/* Vista Agregar Vehículo */}
      {viewMode === 'agregar' && (
        <div className="bg-white border border-gray-300 shadow rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Agregar Nuevo Vehículo</h2>
            <p className="text-gray-600">Registra un nuevo vehículo en la flota de bomberos</p>
          </div>
          <AddVehiculo onSuccess={volverAlDashboard} />
        </div>
      )}

      {/* Vista Actualizar Estado */}
      {viewMode === 'estado' && (
        <div className="bg-white border border-gray-300 shadow rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Actualizar Estado de Vehículo</h2>
            <p className="text-gray-600">Modifica el estado operacional de los vehículos</p>
          </div>
          <UpdateStatus 
            vehiculo={vehiculoSeleccionado ?? undefined} 
            onClose={volverAlDashboard} 
          />
        </div>
      )}

      {/* Vista Programar Mantenimiento */}
      {viewMode === 'programar' && vehiculoSeleccionado && (
        <div className="bg-white border border-gray-300 shadow rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Programar Mantenimiento</h2>
            <p className="text-gray-600">Programa mantenimiento para {vehiculoSeleccionado.placa}</p>
          </div>
          <ScheduleMaintenance 
            vehiculoId={vehiculoSeleccionado.id} 
            onClose={volverAlDashboard} 
          />
        </div>
      )}

      {/* Vista Registrar Mantenimiento */}
      {viewMode === 'registrar' && vehiculoSeleccionado && (
        <div className="bg-white border border-gray-300 shadow rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Registrar Mantenimiento</h2>
            <p className="text-gray-600">Registra mantenimiento realizado para {vehiculoSeleccionado.placa}</p>
          </div>
          <RecordMaintenance 
            vehiculoId={vehiculoSeleccionado.id} 
            onClose={volverAlDashboard} 
          />
        </div>
      )}

      {/* Vista Detalles del Vehículo */}
      {viewMode === 'detalles' && vehiculoSeleccionado && (
        <div className="flex justify-center items-start">
          <DetallesVehiculo 
            vehiculo={vehiculoSeleccionado}
            onClose={volverALista}
          />
        </div>
      )}

      {/* Vista Editar Vehículo */}
      {viewMode === 'editar' && vehiculoSeleccionado && (
        <div className="flex justify-center items-start">
          <EditVehiculo 
            vehiculo={vehiculoSeleccionado}
            onClose={volverALista}
            onSuccess={volverALista}
          />
        </div>
      )}

      {/* Vista Mantenimiento Unificado */}
      {viewMode === 'mantenimiento' && (
        <div className="bg-white border border-gray-300 shadow rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Mantenimiento</h2>
            <p className="text-gray-600">Centro unificado para todas las operaciones de mantenimiento</p>
          </div>
          <MantenimientoVehiculo onBack={volverAlDashboard} />
        </div>
      )}
    </div>
  );
}