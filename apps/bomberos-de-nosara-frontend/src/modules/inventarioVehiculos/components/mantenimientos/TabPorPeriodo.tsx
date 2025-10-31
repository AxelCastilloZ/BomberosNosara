// src/modules/inventarioVehiculos/components/mantenimientos/TabPorPeriodo.tsx

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Filter, X, MoreVertical, CheckCircle, Trash2, Eye, Edit } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { CompletarMantenimientoModal } from '../modals/CompletarMantenimientoModal';
import { DetallesMantenimientoModal } from '../modals/DetallesMantenimientoModal';
import { EditarMantenimientoModal } from '../modals/EditarMantenimientoModal';
import { useNotifications } from '../../../../components/common/notifications/NotificationProvider';
import { useMantenimientosFilters, useDeleteMantenimiento } from '../../hooks/useMantenimientos';
import { EstadoMantenimiento } from '../../../../types/mantenimiento.types';
import type { Mantenimiento } from '../../../../types/mantenimiento.types';

interface MenuPosition {
  top: number;
  left: number;
  openUpwards: boolean;
}

export const TabPorPeriodo: React.FC = () => {
  const { success, error } = useNotifications();
  const [mantenimientoSeleccionado, setMantenimientoSeleccionado] = useState<Mantenimiento | null>(null);
  const [showCompletarModal, setShowCompletarModal] = useState(false);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const {
    mantenimientos,
    isLoading,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  } = useMantenimientosFilters();

  const deleteMutation = useDeleteMantenimiento();

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuAbierto) {
        const target = event.target as HTMLElement;
        if (!target.closest('.menu-dropdown') && !target.closest('.menu-button')) {
          setMenuAbierto(null);
          setMenuPosition(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuAbierto]);

  // Cerrar menú al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      if (menuAbierto) {
        setMenuAbierto(null);
        setMenuPosition(null);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [menuAbierto]);

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getEstadoBadgeColor = (estado: EstadoMantenimiento) => {
    switch (estado) {
      case EstadoMantenimiento.PENDIENTE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case EstadoMantenimiento.EN_REVISION:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case EstadoMantenimiento.COMPLETADO:
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEstadoLabel = (estado: EstadoMantenimiento) => {
    switch (estado) {
      case EstadoMantenimiento.PENDIENTE:
        return 'Pendiente';
      case EstadoMantenimiento.EN_REVISION:
        return 'En Revisión';
      case EstadoMantenimiento.COMPLETADO:
        return 'Completado';
      default:
        return estado;
    }
  };

  const handleEditar = (mantenimiento: Mantenimiento) => {
    setMantenimientoSeleccionado(mantenimiento);
    setShowEditarModal(true);
    setMenuAbierto(null);
    setMenuPosition(null);
  };

  const handleCompletar = (mantenimiento: Mantenimiento) => {
    setMantenimientoSeleccionado(mantenimiento);
    setShowCompletarModal(true);
    setMenuAbierto(null);
    setMenuPosition(null);
  };

  const handleEliminar = async (mantenimiento: Mantenimiento) => {
    try {
      await deleteMutation.mutateAsync({
        id: mantenimiento.id,
        vehiculoId: mantenimiento.vehiculoId,
      });
      success('Mantenimiento eliminado correctamente');
      setConfirmarEliminar(null);
      setMenuAbierto(null);
      setMenuPosition(null);
    } catch (err: any) {
      console.error('Error al eliminar mantenimiento:', err);
      error(err?.message || 'Error al eliminar el mantenimiento');
    }
  };

  const handleVerDetalles = (mantenimiento: Mantenimiento) => {
    setMantenimientoSeleccionado(mantenimiento);
    setShowDetallesModal(true);
    setMenuAbierto(null);
    setMenuPosition(null);
  };

  const puedeCompletar = (estado: EstadoMantenimiento) => {
    return estado === EstadoMantenimiento.PENDIENTE || estado === EstadoMantenimiento.EN_REVISION;
  };

  const toggleMenu = (id: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (menuAbierto === id) {
      setMenuAbierto(null);
      setMenuPosition(null);
    } else {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      
      const MENU_HEIGHT = 160;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < MENU_HEIGHT + 10;
      
      setMenuPosition({
        top: openUpwards ? rect.top - MENU_HEIGHT - 5 : rect.bottom + 5,
        left: rect.right - 192,
        openUpwards,
      });
      
      setMenuAbierto(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Cargando mantenimientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="ml-auto h-7 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar Filtros
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Fecha Inicio */}
          <div className="space-y-2">
            <Label htmlFor="fechaInicio" className="text-xs">
              Desde
            </Label>
            <Input
              id="fechaInicio"
              type="date"
              value={filters.fechaInicio || ''}
              onChange={(e) => updateFilter('fechaInicio', e.target.value || undefined)}
            />
          </div>

          {/* Fecha Fin */}
          <div className="space-y-2">
            <Label htmlFor="fechaFin" className="text-xs">
              Hasta
            </Label>
            <Input
              id="fechaFin"
              type="date"
              value={filters.fechaFin || ''}
              onChange={(e) => updateFilter('fechaFin', e.target.value || undefined)}
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="estado" className="text-xs">
              Estado
            </Label>
            <Select
              id="estado"
              value={filters.estado || ''}
              onChange={(e) => updateFilter('estado', e.target.value as EstadoMantenimiento || undefined)}
            >
              <option value="">Todos los estados</option>
              <option value={EstadoMantenimiento.PENDIENTE}>Pendiente</option>
              <option value={EstadoMantenimiento.EN_REVISION}>En Revisión</option>
              <option value={EstadoMantenimiento.COMPLETADO}>Completado</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Lista de Mantenimientos */}
      <div className="bg-white rounded-lg border border-gray-200">
        {mantenimientos.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {hasActiveFilters
                ? 'No se encontraron mantenimientos con los filtros aplicados'
                : 'No hay mantenimientos registrados aún'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Técnico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mantenimientos.map((mantenimiento) => (
                  <tr key={mantenimiento.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatFecha(mantenimiento.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {mantenimiento.vehiculo?.placa || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                      {mantenimiento.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {mantenimiento.tecnico || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoBadgeColor(
                          mantenimiento.estado
                        )}`}
                      >
                        {getEstadoLabel(mantenimiento.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {confirmarEliminar === mantenimiento.id ? (
                        <Alert variant="destructive" className="p-3">
                          <AlertDescription className="text-xs mb-2">
                            ¿Estás seguro de eliminar este mantenimiento?
                          </AlertDescription>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setConfirmarEliminar(null)}
                              className="h-7 text-xs"
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleEliminar(mantenimiento)}
                              disabled={deleteMutation.isPending}
                              className="h-7 text-xs"
                            >
                              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                            </Button>
                          </div>
                        </Alert>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => toggleMenu(mantenimiento.id, e)}
                          className="h-8 menu-button"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumen */}
      {mantenimientos.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Mostrando {mantenimientos.length} mantenimiento{mantenimientos.length !== 1 ? 's' : ''}
          {hasActiveFilters && ' (filtrado)'}
        </div>
      )}

      {/* Portal para el menú desplegable */}
      {menuAbierto && menuPosition && createPortal(
        <div
          className="menu-dropdown fixed w-48 bg-white rounded-md shadow-lg border border-gray-200 z-[9999]"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <div className="py-1">
            {(() => {
              const mantenimiento = mantenimientos.find(m => m.id === menuAbierto);
              if (!mantenimiento) return null;

              return (
                <>
                  <button
                    onClick={() => handleEditar(mantenimiento)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                    Editar
                  </button>
                  {puedeCompletar(mantenimiento.estado) && (
                    <button
                      onClick={() => handleCompletar(mantenimiento)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Completar
                    </button>
                  )}
                  {mantenimiento.estado === EstadoMantenimiento.COMPLETADO && (
                    <button
                      onClick={() => handleVerDetalles(mantenimiento)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                      Ver Detalles
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setConfirmarEliminar(mantenimiento.id);
                      setMenuAbierto(null);
                      setMenuPosition(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </>
              );
            })()}
          </div>
        </div>,
        document.body
      )}

      {/* Modales */}
      <CompletarMantenimientoModal
        mantenimiento={mantenimientoSeleccionado}
        open={showCompletarModal}
        onOpenChange={setShowCompletarModal}
        onSuccess={() => {
          setMantenimientoSeleccionado(null);
        }}
      />

      <DetallesMantenimientoModal
        mantenimiento={mantenimientoSeleccionado}
        open={showDetallesModal}
        onOpenChange={setShowDetallesModal}
      />

      <EditarMantenimientoModal
        mantenimiento={mantenimientoSeleccionado}
        open={showEditarModal}
        onOpenChange={setShowEditarModal}
        onSuccess={() => {
          setMantenimientoSeleccionado(null);
        }}
      />
    </div>
  );
};