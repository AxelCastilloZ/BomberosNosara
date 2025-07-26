import React from 'react';
import type { Vehicle } from '../../../../interfaces/Vehiculos/vehicle';
import { Search, Filter, Calendar, Settings } from 'lucide-react';

interface VehicleListProps {
  vehicles: Vehicle[];
  onUpdateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  getVehicleIcon: (type: string, className?: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  onProgramar: (vehiculo: Vehicle) => void;
  onRegistrar: (vehiculo: Vehicle) => void;
  onEstado: (vehiculo: Vehicle) => void;
}

export default function VehiculoList({
  vehicles,
  onUpdateVehicle,
  getVehicleIcon,
  getStatusColor,
  onProgramar,
  onRegistrar,
  onEstado,
}: VehicleListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');

  const filteredVehicles = vehicles.filter((vehicle) => {
    const placa = vehicle.placa?.toLowerCase() ?? '';
    const tipo = vehicle.tipo?.toLowerCase() ?? '';
    const estado = vehicle.estadoActual?.toLowerCase() ?? '';

    const matchesSearch = placa.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || estado === statusFilter;
    const matchesType = typeFilter === 'all' || tipo === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusLabel = (status: string) => {
    const labels = {
      activo: 'Disponible',
      'en mantenimiento': 'Mantenimiento',
      'en reparación': 'Reparación',
      'dado de baja': 'Dado de baja',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      camión: 'Camión',
      ambulancia: 'Ambulancia',
      pickup: 'Pickup',
      moto: 'Motocicleta',
      'vehículo utilitario': 'Vehículo utilitario',
      otro: 'Otro',
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white shadow p-4 rounded">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-slate-300 rounded p-2"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 border border-slate-300 rounded p-2"
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Disponible</option>
            <option value="en mantenimiento">Mantenimiento</option>
            <option value="en reparación">Reparación</option>
            <option value="dado de baja">Dado de baja</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full md:w-48 border border-slate-300 rounded p-2"
          >
            <option value="all">Todos los tipos</option>
            <option value="camión">Camión</option>
            <option value="ambulancia">Ambulancia</option>
            <option value="pickup">Pickup</option>
            <option value="moto">Motocicleta</option>
            <option value="vehículo utilitario">Vehículo utilitario</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>

      {/* Lista de Vehículos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="border rounded shadow hover:shadow-lg transition-all">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                  {getVehicleIcon(vehicle.tipo, 'h-6 w-6 text-slate-600')}
                </div>
                <div>
                  <h3 className="font-bold">{vehicle.placa}</h3>
                  <p className="text-sm text-slate-500">{getTypeLabel(vehicle.tipo)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(vehicle.estadoActual)}`} />
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div className="text-sm font-medium text-slate-900">
                Estado inicial: {vehicle.estadoInicial}
              </div>
              <div className="text-xs inline-block px-2 py-1 border rounded bg-slate-100">
                {getStatusLabel(vehicle.estadoActual)}
              </div>
              <div className="text-sm flex justify-between">
                <span className="text-slate-500">Adquisición:</span>
                <span>{new Date(vehicle.fechaAdquisicion).toLocaleDateString()}</span>
              </div>
              {vehicle.kilometraje !== undefined && (
                <div className="text-sm flex justify-between">
                  <span className="text-slate-500">Kilometraje:</span>
                  <span>{vehicle.kilometraje.toLocaleString()} km</span>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  className="text-xs flex-1 border rounded py-1 px-2 bg-white hover:bg-slate-50"
                  onClick={() => onEstado(vehicle)}
                >
                  <Settings className="h-3 w-3 inline-block mr-1" />
                  Estado
                </button>
                <button
                  className="text-xs flex-1 border rounded py-1 px-2 bg-white hover:bg-slate-50"
                  onClick={() => onProgramar(vehicle)}
                >
                  <Calendar className="h-3 w-3 inline-block mr-1" />
                  Programar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="bg-white text-center p-12 border rounded shadow">
          <Filter className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron vehículos</h3>
          <p className="text-slate-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      <div className="bg-slate-50 border rounded p-4 text-sm flex justify-between">
        <span className="text-slate-600">
          Mostrando {filteredVehicles.length} de {vehicles.length} vehículos
        </span>
        <div className="flex gap-4">
          <span className="text-slate-600">
            Disponibles:{' '}
            <span className="font-medium text-emerald-600">
              {filteredVehicles.filter((v) => v.estadoActual.toLowerCase() === 'activo').length}
            </span>
          </span>
          <span className="text-slate-600">
            En servicio:{' '}
            <span className="font-medium text-amber-600">
              {filteredVehicles.filter((v) => v.estadoActual.toLowerCase() === 'en mantenimiento').length}
            </span>
          </span>
          <span className="text-slate-600">
            Críticos:{' '}
            <span className="font-medium text-red-600">
              {filteredVehicles.filter((v) => v.estadoActual.toLowerCase() === 'en reparación').length}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
