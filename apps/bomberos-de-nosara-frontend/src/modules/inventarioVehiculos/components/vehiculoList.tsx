import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, Edit, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Vehicle } from '../../../types/vehiculo.types';
import { 
  TYPE_FILTER_OPTIONS, 
  STATUS_FILTER_OPTIONS, 
  getStatusColor 
} from '../utils/vehiculoConstants';
import { capitalize, getStatusLabel } from '../utils/vehiculoHelpers';
import { getIconForType } from '../utils/vehiculoIcons';
import { useVehiculos } from '../hooks/useVehiculos';

interface VehiculoListProps {
  getVehicleIcon: (type: string, className?: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  onEstado: (vehicle: Vehicle) => void;
  onVerDetalles: (vehicle: Vehicle) => void;
  onEditar: (vehicle: Vehicle) => void;
}

export default function VehiculoList({
  getVehicleIcon,
  getStatusColor: getStatusColorProp,
  onEstado,
  onVerDetalles,
  onEditar,
}: VehiculoListProps) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const limit = 9; // 9 vehículos por página (3x3 grid)

  // Usar el hook con paginación
  const { data: response, isLoading } = useVehiculos({
    page,
    limit,
    search: searchTerm,
    status: statusFilter,
    type: typeFilter,
  });

  // Determinar si la respuesta es paginada o no
  const isPaginated = response && 'data' in response;
  const vehicles = isPaginated ? response.data : (response as Vehicle[]) || [];
  const total = isPaginated ? response.total : vehicles.length;
  const totalPages = isPaginated ? response.totalPages : 1;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    setPage(1);
  };

  const goToPage = (pageNum: number) => {
    setPage(Math.max(1, Math.min(pageNum, totalPages)));
  };

  if (isLoading) {
    return (
      <div className="text-center p-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <p className="mt-2 text-gray-600">Cargando vehículos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white shadow p-4 rounded">
        <div className="flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por placa..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-full border border-slate-300 rounded p-2 text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
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
              onChange={(e) => handleTypeFilter(e.target.value)}
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

      {/* Grid de Vehículos */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => {
          const typeLabel = capitalize(vehicle.tipo ?? '');
          const icon = getIconForType(vehicle.tipo ?? '', 'h-6 w-6 text-slate-600');

          return (
            <div key={vehicle.id} className="border rounded shadow hover:shadow-lg transition-all bg-white">
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
      {vehicles.length === 0 && !isLoading && (
        <div className="bg-white text-center p-8 sm:p-12 border rounded shadow">
          <Filter className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">No se encontraron vehículos</h3>
          <p className="text-sm text-slate-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Paginación */}
      {isPaginated && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-6 py-4">
          <div className="text-sm text-gray-600">
            Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de {total} vehículos
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className={`p-2 rounded-lg border transition-colors ${
                page === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const showPage = 
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= page - 1 && pageNum <= page + 1);
                
                const showEllipsis = 
                  (pageNum === page - 2 && page > 3) ||
                  (pageNum === page + 2 && page < totalPages - 2);

                if (showEllipsis) {
                  return <span key={pageNum} className="px-3 py-2 text-gray-400">...</span>;
                }

                if (!showPage) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-red-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className={`p-2 rounded-lg border transition-colors ${
                page === totalPages
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer con estadísticas */}
      {isPaginated && (
        <div className="bg-slate-50 border rounded p-3 sm:p-4 text-xs sm:text-sm">
          <div className="text-slate-600 text-center sm:text-left">
            Total de <span className="font-semibold">{total}</span> vehículos en el sistema
          </div>
        </div>
      )}
    </div>
  );
}