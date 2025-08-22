import React, { useState } from 'react';
import AddVehiculo from './addVehiculo';
import UpdateStatus from './updateStatus';
import ScheduleMaintenance from './scheduleMaintenance';
import RecordMaintenance from './recordMaintenance';
import VehiculoList from './vehiculoList';
import { Vehicle } from '../../../../interfaces/Vehiculos/vehicle';
import { useVehiculos, useUpdateVehiculo } from '../../../../hooks/useVehiculos';
import { Truck, Ambulance, Car, Bike, Wrench } from 'lucide-react';
import { VehiculoView } from 'apps/bomberos-de-nosara-frontend/src/types/vehiculos/vehiculoTypes';

interface DashboardVehiculoProps {
  overrideModal?: (modalKey: VehiculoView, vehiculo?: Vehicle) => void;
}

export default function DashboardVehiculo({ overrideModal }: DashboardVehiculoProps) {
  const [viewMode, setViewMode] = useState<VehiculoView>('lista');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehicle | null>(null);

  const { data: vehicles = [] } = useVehiculos();
  const updateVehiculo = useUpdateVehiculo();

  const volverAlInicio = () => {
    setVehiculoSeleccionado(null);
    setViewMode('lista');
  };

  const getVehicleIcon = (type: string, className = 'h-5 w-5') => {
    switch (type) {
      case 'camión': return <Truck className={className} />;
      case 'ambulancia': return <Ambulance className={className} />;
      case 'pickup': return <Car className={className} />;
      case 'moto': return <Bike className={className} />;
      default: return <Wrench className={className} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-emerald-500';
      case 'en mantenimiento': return 'bg-amber-500';
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

  const vistaActual = viewMode;

  return (
    <div className="p-6">
      {vistaActual === 'agregar' && <AddVehiculo onSuccess={volverAlInicio} />}
      {vistaActual === 'estado' && <UpdateStatus vehiculo={vehiculoSeleccionado || undefined} onClose={volverAlInicio} />}
      {vistaActual === 'programar' && <ScheduleMaintenance onClose={volverAlInicio} vehiculoId={vehiculoSeleccionado?.id} />}
      {vistaActual === 'registrar' && <RecordMaintenance onClose={volverAlInicio} vehiculoId={vehiculoSeleccionado?.id} />}

      {vistaActual === 'lista' && (
        <VehiculoList
          vehicles={vehicles}
          onUpdateVehicle={(id, updates) => updateVehiculo.mutate({ id, ...updates })}
          getVehicleIcon={getVehicleIcon}
          getStatusColor={getStatusColor}
          onProgramar={(vehiculo) => cambiarVista('programar', vehiculo)}
          onRegistrar={(vehiculo) => cambiarVista('registrar', vehiculo)}
          onEstado={(vehiculo) => cambiarVista('estado', vehiculo)}
        />
      )}
    </div>
  );
}
