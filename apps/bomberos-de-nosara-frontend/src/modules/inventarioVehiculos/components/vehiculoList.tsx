import React, { useState } from 'react';
import { Search, Filter, Eye, Edit, RefreshCw } from 'lucide-react';
import type { Vehicle } from '../../../types/vehiculo.types';
import type { VehicleListProps } from '../types';
import { 
  TYPE_FILTER_OPTIONS, 
  STATUS_FILTER_OPTIONS, 
  getStatusColor 
} from '../utils/vehiculoConstants';
import { capitalize, getStatusLabel } from '../utils/vehiculoHelpers';
import { getIconForType } from '../utils/vehiculoIcons';

export default function VehiculoList({
  vehicles,
  onUpdateVehicle,
  getVehicleIcon,
  getStatusColor: getStatusColorProp,
  onEstado,
  onVerDetalles,
  onEditar,
}: VehicleListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredVehicles = vehicles.filter((vehicle) => {
    const placa = (vehicle.placa ?? '').toLowerCase();
    const estado = vehicle.estadoActual ?? '';
    const tipo = vehicle.tipo ?? '';

    const matchesSearch = placa.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || estado === statusFilter;
    const matchesType = typeFilter === 'all' || tipo === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Filtros - Mejorados responsive */}
      <div className="bg-white shadow p-4 rounded">
        <div className="flex flex-col gap-3">
          {/* Búsqueda - ancho completo en móvil */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-slate-300 rounded p-2 text-sm"
            />
          </div>

          {/* Filtros lado a lado en desktop, apilados en móvil */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:flex-1 border border-slate-300 rounded p-2 text-sm"
            >
              <option value="all">Todos los estados</option>
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:flex-1 border border-slate-300 rounded p-2 text-sm"
            >
              <option value="all">Todos los tipos</option>
              {TYPE_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Vehículos - Grid responsive */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle) => {
          const typeLabel = capitalize(vehicle.tipo ?? '');
          const icon = getIconForType(vehicle.tipo ?? '', 'h-6 w-6 text-slate-600');

          return (
            <div key={vehicle.id} className="border rounded shadow hover:shadow-lg transition-all bg-white">
              {/* Header de la tarjeta */}
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex gap-3 items-center min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm sm:text-base truncate">{vehicle.placa}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 truncate">{typeLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(vehicle.estadoActual)}`} />
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-4 space-y-2">
                {vehicle.estadoInicial && (
                  <div className="text-xs sm:text-sm font-medium text-slate-900">
                    Estado inicial: {capitalize(vehicle.estadoInicial)}
                  </div>
                )}
                <div className="text-xs inline-block px-2 py-1 border rounded bg-slate-100">
                  {getStatusLabel(vehicle.estadoActual)}
                </div>
                {vehicle.fechaAdquisicion && (
                  <div className="text-xs sm:text-sm flex justify-between gap-2">
                    <span className="text-slate-500">Adquisición:</span>
                    <span className="font-medium">{new Date(vehicle.fechaAdquisicion).toLocaleDateString()}</span>
                  </div>
                )}
                {typeof vehicle.kilometraje === 'number' && (
                  <div className="text-xs sm:text-sm flex justify-between gap-2">
                    <span className="text-slate-500">Kilometraje:</span>
                    <span className="font-medium">{vehicle.kilometraje.toLocaleString()} km</span>
                  </div>
                )}
                
                {/* Botones - 100% responsive */}
                <div className="grid grid-cols-3 gap-2 pt-3">
                  <button
                    className="text-xs flex items-center justify-center gap-1 border rounded py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors"
                    onClick={() => onVerDetalles(vehicle)}
                    title="Ver detalles del vehículo"
                  >
                    <Eye className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="hidden sm:inline">Ver</span>
                  </button>
                  
                  <button
                    className="text-xs flex items-center justify-center gap-1 border rounded py-2 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium transition-colors"
                    onClick={() => onEditar(vehicle)}
                    title="Editar vehículo"
                  >
                    <Edit className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                  
                  <button
                    className="text-xs flex items-center justify-center gap-1 border rounded py-2 px-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium transition-colors"
                    onClick={() => onEstado(vehicle)}
                    title="Cambiar estado"
                  >
                    <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="hidden sm:inline">Estado</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensaje cuando no hay resultados */}
      {filteredVehicles.length === 0 && (
        <div className="bg-white text-center p-8 sm:p-12 border rounded shadow">
          <Filter className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">No se encontraron vehículos</h3>
          <p className="text-sm text-slate-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Footer con estadísticas - Totalmente responsive */}
      <div className="bg-slate-50 border rounded p-3 sm:p-4 text-xs sm:text-sm">
        <div className="flex flex-col gap-3">
          {/* Total de vehículos */}
          <div className="text-slate-600 text-center sm:text-left">
            Mostrando <span className="font-semibold">{filteredVehicles.length}</span> de{' '}
            <span className="font-semibold">{vehicles.length}</span> vehículos
          </div>
          
          {/* Estadísticas por estado - Grid responsive */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 justify-center sm:justify-start">
            <div className="text-slate-600">
              En servicio:{' '}
              <span className="font-semibold text-emerald-600">
                {filteredVehicles.filter((v) => v.estadoActual === 'en servicio').length}
              </span>
            </div>
            <div className="text-slate-600">
              Malos:{' '}
              <span className="font-semibold text-amber-600">
                {filteredVehicles.filter((v) => v.estadoActual === 'malo').length}
              </span>
            </div>
            <div className="text-slate-600">
              Fuera:{' '}
              <span className="font-semibold text-orange-600">
                {filteredVehicles.filter((v) => v.estadoActual === 'fuera de servicio').length}
              </span>
            </div>
            <div className="text-slate-600">
              Baja:{' '}
              <span className="font-semibold text-red-600">
                {filteredVehicles.filter((v) => v.estadoActual === 'dado de baja').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}