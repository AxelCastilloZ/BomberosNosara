import React, { useState } from 'react';
import { Truck, Ambulance, Car, Bike, Wrench } from 'lucide-react';

// Types globales
import type { Vehicle } from '../../../types/vehiculo.types';

import type { DashboardVehiculoProps, VehiculoView } from '../types';
import { useVehiculos } from '../hooks/useVehiculos';

// Componentes del módulo
import AddVehiculo from './addVehiculo';
import UpdateStatus from './updateStatus';
import ScheduleMaintenance from './scheduleMaintenance';
import RecordMaintenance from './recordMaintenance';
import VehiculoList from './vehiculoList';
import DetallesVehiculo from './DetallesVehiculo';
import EditVehiculo from './EditVehiculo';

export default function DashboardVehiculo({ overrideModal }: DashboardVehiculoProps) {
  const [viewMode, setViewMode] = useState<VehiculoView>('lista');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehicle | null>(null);

  const { data: vehicles = [], refetch } = useVehiculos();

  const volverAlInicio = () => {
    setVehiculoSeleccionado(null);
    setViewMode('lista');
    refetch(); // Recargar lista después de cambios
  };

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
    
    // Fallback para atv, jet ski, lancha, dron
    return <Wrench className={className} />;
  };

  // Colores para los 4 estados del backend
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
    if (!vehiculo && nuevaVista !== 'lista' && nuevaVista !== 'agregar') return;
    
    if (overrideModal) {
      overrideModal(nuevaVista, vehiculo);
    } else {
      setVehiculoSeleccionado(vehiculo ?? null);
      setViewMode(nuevaVista);
    }
  };

  return (
    <div className="p-6">
      {viewMode === 'agregar' && (
        <AddVehiculo onSuccess={volverAlInicio} />
      )}
      
      {viewMode === 'estado' && (
        <UpdateStatus 
          vehiculo={vehiculoSeleccionado || undefined} 
          onClose={volverAlInicio} 
        />
      )}
      
      {viewMode === 'programar' && (
        <ScheduleMaintenance 
          onClose={volverAlInicio} 
          vehiculoId={vehiculoSeleccionado?.id} 
        />
      )}
      
      {viewMode === 'registrar' && (
        <RecordMaintenance 
          onClose={volverAlInicio} 
          vehiculoId={vehiculoSeleccionado?.id} 
        />
      )}

      {viewMode === 'detalles' && vehiculoSeleccionado && (
        <div className="flex justify-center items-start">
          <DetallesVehiculo 
            vehiculo={vehiculoSeleccionado}
            onClose={volverAlInicio}
          />
        </div>
      )}

      {viewMode === 'editar' && vehiculoSeleccionado && (
        <div className="flex justify-center items-start">
          <EditVehiculo 
            vehiculo={vehiculoSeleccionado}
            onClose={volverAlInicio}
            onSuccess={volverAlInicio}
          />
        </div>
      )}

      {viewMode === 'lista' && (
        <VehiculoList
          vehicles={vehicles}
          onUpdateVehicle={() => {}} // No se usa, placeholder
          getVehicleIcon={getVehicleIcon}
          getStatusColor={getStatusColor}
          onEstado={(vehiculo) => cambiarVista('estado', vehiculo)}
          onVerDetalles={(vehiculo) => cambiarVista('detalles', vehiculo)}
          onEditar={(vehiculo) => cambiarVista('editar', vehiculo)}
        />
      )}
    </div>
  );
}