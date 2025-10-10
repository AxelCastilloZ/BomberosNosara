import React, { useMemo, useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Wrench, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  Trash2,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import type { HistorialMantenimientosProps, ItemHistorial } from '../types';
import type { Vehicle } from '../../../types/vehiculo.types';
import { 
  useVehiculos, 
  useHistorialVehiculo,
  useCancelarMantenimientoProgramado,
  useDeleteMantenimiento,
  useRestoreMantenimiento
} from '../hooks/useVehiculos';
import { formatMoney, shortDate, formatTypeLabel } from '../utils/vehiculoHelpers';
import { useCrudNotifications } from '../../../hooks/useCrudNotifications';

const ITEMS_PER_PAGE = 10;

// Tipo extendido para incluir mantenimiento programado
interface ExtendedHistorial {
  id: string;
  fecha: string;
  descripcion: string;
  tipo: 'completado' | 'programado';
  isProgramado?: boolean;
  tecnico?: string;
  kilometraje?: number;
  costo?: number;
  observaciones?: string;
  created_by?: number;
  createdAt?: string | Date;
  updated_by?: number;
  updatedAt?: string | Date;
  deleted_by?: number;
  deletedAt?: string | Date | null;
}

export default function HistorialMantenimientos({ onClose }: HistorialMantenimientosProps) {
  const { notifyDeleted, notifyError, notifyUpdated } = useCrudNotifications();
  const { data: vehiclesResponse = [] } = useVehiculos();
  const [vehiculoId, setVehiculoId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteModalItem, setDeleteModalItem] = useState<ExtendedHistorial | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  
  const { data: historial = [], isFetching } = useHistorialVehiculo(vehiculoId);
  const cancelarMantenimiento = useCancelarMantenimientoProgramado();
  const deleteMantenimiento = useDeleteMantenimiento();
  const restoreMantenimiento = useRestoreMantenimiento();

  // Extraer el array de vehículos correctamente
  const vehicles: Vehicle[] = useMemo(() => {
    if (Array.isArray(vehiclesResponse)) {
      return vehiclesResponse;
    }
    if (vehiclesResponse && 'data' in vehiclesResponse) {
      return vehiclesResponse.data;
    }
    return [];
  }, [vehiclesResponse]);

  // Obtener el vehículo seleccionado para acceder a fechaProximoMantenimiento
  const vehiculoSeleccionado = useMemo(() => {
    return vehicles.find(v => v.id === vehiculoId);
  }, [vehicles, vehiculoId]);

  // Combinar mantenimientos registrados + programado
  const historialCompleto: ExtendedHistorial[] = useMemo(() => {
    const registrados: ExtendedHistorial[] = (historial as ItemHistorial[]).map(item => ({
      id: item.id,
      fecha: item.fecha,
      descripcion: item.descripcion,
      tipo: 'completado' as const,
      isProgramado: false,
      tecnico: item.tecnico,
      kilometraje: item.kilometraje,
      costo: item.costo,
      observaciones: item.observaciones,
      created_by: item.created_by,
      createdAt: item.createdAt,
      updated_by: item.updated_by,
      updatedAt: item.updatedAt,
      deleted_by: item.deleted_by,
      deletedAt: item.deletedAt,
    }));

    // Agregar mantenimiento programado si existe
    if (vehiculoSeleccionado?.fechaProximoMantenimiento) {
      const fechaProgramada = new Date(vehiculoSeleccionado.fechaProximoMantenimiento);
      const hoy = new Date();
      
      // Solo mostrar si es fecha futura (pendiente)
      if (fechaProgramada >= hoy) {
        registrados.unshift({
          id: `programado-${vehiculoId}`,
          fecha: vehiculoSeleccionado.fechaProximoMantenimiento,
          descripcion: 'Mantenimiento Programado',
          tipo: 'programado' as const,
          isProgramado: true,
          tecnico: '—',
          kilometraje: vehiculoSeleccionado.kilometraje || 0,
          costo: 0,
          observaciones: 'Pendiente de realizar',
        });
      }
    }

    return registrados;
  }, [historial, vehiculoSeleccionado, vehiculoId]);

  // Filtrar según showDeleted
  const historialFiltrado = useMemo(() => {
    if (showDeleted) {
      return historialCompleto;
    }
    return historialCompleto.filter(item => !item.deletedAt);
  }, [historialCompleto, showDeleted]);

  const historialOrdenado = useMemo(() => {
    return [...historialFiltrado].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [historialFiltrado]);

  const total = useMemo(() => 
    historialOrdenado
      .filter(item => !item.isProgramado && !item.deletedAt)
      .reduce((acc, it) => acc + (Number(it.costo) || 0), 0), 
    [historialOrdenado]
  );

  // Paginación
  const totalPages = Math.ceil(historialOrdenado.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedHistorial = historialOrdenado.slice(startIndex, endIndex);

  // Reset página cuando cambia el vehículo
  const handleVehiculoChange = (newVehiculoId: string) => {
    setVehiculoId(newVehiculoId);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Función para formatear fecha y hora legible
  const formatDateTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para generar el contenido del tooltip
  const getTooltipContent = (item: ExtendedHistorial) => {
    if (item.isProgramado) {
      return 'Mantenimiento pendiente de realizar';
    }

    const lines = [];
    
    if (item.created_by && item.createdAt) {
      lines.push(`Creado por: Usuario ${item.created_by}`);
      lines.push(`Fecha creación: ${formatDateTime(item.createdAt)}`);
    }
    
    if (item.updated_by && item.updatedAt) {
      lines.push(`Modificado por: Usuario ${item.updated_by}`);
      lines.push(`Fecha modificación: ${formatDateTime(item.updatedAt)}`);
    }
    
    if (item.deletedAt) {
      lines.push(`Eliminado el: ${formatDateTime(item.deletedAt)}`);
      if (item.deleted_by) {
        lines.push(`Eliminado por: Usuario ${item.deleted_by}`);
      }
    }
    
    return lines.length > 0 ? lines.join('\n') : 'Sin información de auditoría';
  };

  // Función para truncar texto
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Handler para cancelar mantenimiento programado
  const handleCancelarProgramado = async () => {
    if (!vehiculoId) return;
    
    try {
      await cancelarMantenimiento.mutateAsync(vehiculoId);
      notifyUpdated('Mantenimiento programado cancelado');
      setCancelModalOpen(false);
    } catch (error: any) {
      notifyError('cancelar el mantenimiento', error.message);
    }
  };

  // Handler para eliminar mantenimiento
  const handleDeleteMantenimiento = async (item: ExtendedHistorial) => {
    if (!item.id || item.isProgramado) return;
    
    try {
      await deleteMantenimiento.mutateAsync({ 
        id: item.id, 
        vehiculoId 
      });
      notifyDeleted('Mantenimiento');
      setDeleteModalItem(null);
    } catch (error: any) {
      notifyError('eliminar el mantenimiento', error.message);
    }
  };

  // Handler para restaurar mantenimiento
  const handleRestoreMantenimiento = async (item: ExtendedHistorial) => {
    if (!item.id || item.isProgramado) return;
    
    try {
      await restoreMantenimiento.mutateAsync({ 
        id: item.id, 
        vehiculoId 
      });
      notifyUpdated('Mantenimiento restaurado');
    } catch (error: any) {
      notifyError('restaurar el mantenimiento', error.message);
    }
  };

  const isLoading = cancelarMantenimiento.isPending || deleteMantenimiento.isPending || restoreMantenimiento.isPending;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <button 
        onClick={onClose} 
        className="flex items-center gap-2 mb-6 sm:mb-8 text-red-600 hover:text-red-700 font-medium transition-colors"
      >
        <ArrowLeft className="h-5 w-5" /> Volver al menú de mantenimiento
      </button>

      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Historial de Mantenimientos</h2>
        <p className="text-sm sm:text-base text-gray-500">Consulta los mantenimientos realizados y programados por vehículo</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900 mb-2">Vehículo</label>
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
              value={vehiculoId}
              onChange={(e) => handleVehiculoChange(e.target.value)}
            >
              <option value="">-- Seleccione un vehículo --</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {truncateText(`${v.placa} — ${formatTypeLabel(v.tipo)}`, 60)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:min-w-[300px]">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-medium">Registros</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{historialOrdenado.filter(h => !h.isProgramado).length}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Wrench className="w-4 h-4" />
                <span className="text-xs font-medium">Costo total</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate" title={formatMoney(total)}>
                {formatMoney(total)}
              </p>
            </div>
          </div>
        </div>

        {vehiculoId && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              Mostrar mantenimientos eliminados
            </label>
          </div>
        )}
      </div>

      {!vehiculoId ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 sm:p-16 text-center">
          <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm sm:text-base text-gray-500">Selecciona un vehículo para ver su historial</p>
        </div>
      ) : isFetching ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 sm:p-16 text-center">
          <p className="text-sm sm:text-base text-gray-500">Cargando historial...</p>
        </div>
      ) : historialOrdenado.length > 0 ? (
        <>
          {/* Vista de tabla para desktop */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Estado</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Fecha</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Descripción</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Técnico</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Kilometraje</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Costo</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Observaciones</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Info</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedHistorial.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-gray-50 group ${item.deletedAt ? 'bg-red-50' : ''}`}
                    >
                      {/* Estado */}
                      <td className="px-6 py-4">
                        {item.deletedAt ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <Trash2 className="w-3 h-3" />
                            Eliminado
                          </span>
                        ) : item.isProgramado ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <Clock className="w-3 h-3" />
                            Pendiente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle2 className="w-3 h-3" />
                            Completado
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">{shortDate(item.fecha)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="block max-w-[200px] truncate" title={item.descripcion}>
                          {item.descripcion}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="block max-w-[120px] truncate" title={item.tecnico || '—'}>
                          {item.tecnico || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">
                        {item.isProgramado ? '—' : `${Number(item.kilometraje || 0).toLocaleString()} km`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                        {item.isProgramado ? '—' : formatMoney(Number(item.costo || 0))}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="block max-w-[150px] truncate" title={item.observaciones || '—'}>
                          {item.observaciones || '—'}
                        </span>
                      </td>
                      
                      {/* Info */}
                      <td className="px-6 py-4 text-center">
                        <div className="relative inline-block group/tooltip">
                          <Info className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help transition-colors mx-auto" />
                          
                          <div className="invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-pre-line min-w-[250px] shadow-xl">
                            {getTooltipContent(item)}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                              <div className="border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {item.isProgramado ? (
                            <button
                              onClick={() => setCancelModalOpen(true)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              disabled={isLoading}
                              title="Cancelar mantenimiento programado"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          ) : item.deletedAt ? (
                            <button
                              onClick={() => handleRestoreMantenimiento(item)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              disabled={isLoading}
                              title="Restaurar mantenimiento"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setDeleteModalItem(item)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              disabled={isLoading}
                              title="Eliminar mantenimiento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista de cards para móvil */}
          <div className="lg:hidden space-y-4 mb-4">
            {paginatedHistorial.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white rounded-xl shadow-sm border p-4 ${
                  item.deletedAt ? 'border-red-200 bg-red-50' : 'border-gray-100'
                }`}
              >
                {/* Header con estado y fecha */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    {item.deletedAt ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <Trash2 className="w-3 h-3" />
                        Eliminado
                      </span>
                    ) : item.isProgramado ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <Clock className="w-3 h-3" />
                        Pendiente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3" />
                        Completado
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">{shortDate(item.fecha)}</span>
                </div>

                {/* Descripción */}
                <h3 className="font-semibold text-gray-900 mb-3 break-words">{item.descripcion}</h3>

                {/* Detalles */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Técnico:</span>
                    <span className="text-gray-900 font-medium truncate ml-2" title={item.tecnico || '—'}>
                      {item.tecnico || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kilometraje:</span>
                    <span className="text-gray-900 font-medium">
                      {item.isProgramado ? '—' : `${Number(item.kilometraje || 0).toLocaleString()} km`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Costo:</span>
                    <span className="text-gray-900 font-bold">
                      {item.isProgramado ? '—' : formatMoney(Number(item.costo || 0))}
                    </span>
                  </div>
                  {item.observaciones && item.observaciones !== '—' && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-gray-600 block mb-1">Observaciones:</span>
                      <p className="text-gray-900 text-xs break-words">{item.observaciones}</p>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // Mostrar tooltip de info en modal o alert para móvil
                      alert(getTooltipContent(item));
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Info className="w-4 h-4" />
                    Info
                  </button>
                  
                  {item.isProgramado ? (
                    <button
                      onClick={() => setCancelModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  ) : item.deletedAt ? (
                    <button
                      onClick={() => handleRestoreMantenimiento(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Restaurar
                    </button>
                  ) : (
                    <button
                      onClick={() => setDeleteModalItem(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-gray-100 px-4 sm:px-6 py-4">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Mostrando {startIndex + 1} - {Math.min(endIndex, historialOrdenado.length)} de {historialOrdenado.length} registros
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg border transition-colors ${
                    currentPage === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // En móvil mostrar menos páginas
                    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                    const showPage = isMobile
                      ? page === 1 || page === totalPages || page === currentPage
                      : page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                    
                    const showEllipsis = isMobile
                      ? (page === currentPage - 1 && currentPage > 2) ||
                        (page === currentPage + 1 && currentPage < totalPages - 1)
                      : (page === currentPage - 2 && currentPage > 3) ||
                        (page === currentPage + 2 && currentPage < totalPages - 2);

                    if (showEllipsis) {
                      return <span key={page} className="px-2 py-2 text-gray-400 text-sm">...</span>;
                    }

                    if (!showPage) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`min-w-[32px] sm:min-w-[40px] px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-red-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg border transition-colors ${
                    currentPage === totalPages
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 sm:p-16 text-center">
          <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm sm:text-base text-gray-500">No hay registros para este vehículo</p>
        </div>
      )}

      {/* Modal para cancelar mantenimiento programado */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Cancelar Mantenimiento
              </h3>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">
              ¿Estás seguro de que deseas cancelar el mantenimiento programado para el{' '}
              <span className="font-semibold">
                {vehiculoSeleccionado?.fechaProximoMantenimiento && 
                  new Date(vehiculoSeleccionado.fechaProximoMantenimiento).toLocaleDateString('es-CR')}
              </span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
                disabled={isLoading}
              >
                Volver
              </button>
              <button
                onClick={handleCancelarProgramado}
                className={`flex-1 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                  isLoading
                    ? 'bg-amber-400 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
                {isLoading ? 'Cancelando...' : 'Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para eliminar mantenimiento registrado */}
      {deleteModalItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Eliminar Mantenimiento
              </h3>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">
              ¿Estás seguro de que deseas eliminar el mantenimiento{' '}
              <span className="font-bold text-red-600 break-words">{deleteModalItem.descripcion}</span>{' '}
              realizado el {shortDate(deleteModalItem.fecha)}?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalItem(null)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteMantenimiento(deleteModalItem)}
                className={`flex-1 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                  isLoading
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4" />
                {isLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}