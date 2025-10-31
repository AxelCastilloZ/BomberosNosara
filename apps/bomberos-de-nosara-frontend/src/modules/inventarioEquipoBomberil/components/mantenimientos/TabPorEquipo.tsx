import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Search, Wrench, MoreVertical, CheckCircle, Trash2, Eye, Edit } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { CompletarMantenimientoEquipoModal } from '../modals/CompletarMantenimientoEquipoModal';
import { DetallesMantenimientoEquipoModal } from '../modals/DetallesMantenimientoEquipoModal';
import { EditarMantenimientoModal } from '../modals/EditarMantenimientoModal';
import { RegistrarMantenimientoModal } from '../modals/RegistrarMantenimientoModal';
import { ProgramarMantenimientoModal } from '../modals/ProgramarMantenimientoModal';
import { useNotifications } from '../../../../components/common/notifications/NotificationProvider';
import { useEquipos } from '../../hooks/useEquipos';
import { useHistorialEquipo, useDeleteMantenimiento } from '../../hooks/useMantenimientos';
import { getTipoEquipoLabel, getEquipoIcon } from '../../utils/equipoBomberilHelpers';
import { EstadoMantenimiento } from '../../../../types/mantenimientoEquipo.types';
import type { MantenimientoEquipo } from '../../../../types/mantenimientoEquipo.types';
import type { EquipoBomberil } from '../../../../types/equipoBomberil.types';

interface MenuPosition {
  top: number;
  left: number;
  openUpwards: boolean;
}

export const TabPorEquipo: React.FC = () => {
  const { success, error } = useNotifications();
  
  // Estados
  const [equipoSeleccionadoId, setEquipoSeleccionadoId] = useState<string>('');
  const [busquedaEquipo, setBusquedaEquipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoMantenimiento | ''>('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [mantenimientoSeleccionado, setMantenimientoSeleccionado] = useState<MantenimientoEquipo | null>(null);
  const [showCompletarModal, setShowCompletarModal] = useState(false);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);
  const [showProgramarModal, setShowProgramarModal] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  // Queries
  const { data: equiposResponse, isLoading: isLoadingEquipos } = useEquipos();
  const { data: historial = [], isLoading: isLoadingHistorial } = useHistorialEquipo(equipoSeleccionadoId);
  const deleteMutation = useDeleteMantenimiento();

  // Extraer equipos
  const equipos: EquipoBomberil[] = useMemo(() => {
    if (!equiposResponse) return [];
    if (Array.isArray(equiposResponse)) return equiposResponse;
    if ('data' in equiposResponse) return (equiposResponse as any).data || [];
    return [];
  }, [equiposResponse]);

  // Filtrar equipos por búsqueda
  const equiposFiltrados = useMemo(() => {
    if (!busquedaEquipo) return equipos;
    const busqueda = busquedaEquipo.toLowerCase();
    return equipos.filter(
      (e: EquipoBomberil) =>
        e.numeroSerie.toLowerCase().includes(busqueda) ||
        e.nombre.toLowerCase().includes(busqueda) ||
        getTipoEquipoLabel(e.tipo).toLowerCase().includes(busqueda)
    );
  }, [equipos, busquedaEquipo]);

  // Filtrar historial
  const historialFiltrado = useMemo(() => {
    let resultado = [...historial];

    if (filtroEstado) {
      resultado = resultado.filter(m => m.estado === filtroEstado);
    }

    if (filtroFechaInicio) {
      const fechaInicio = new Date(filtroFechaInicio);
      fechaInicio.setHours(0, 0, 0, 0);
      resultado = resultado.filter(m => {
        const fechaM = new Date(m.fecha);
        fechaM.setHours(0, 0, 0, 0);
        return fechaM >= fechaInicio;
      });
    }

    if (filtroFechaFin) {
      const fechaFin = new Date(filtroFechaFin);
      fechaFin.setHours(0, 0, 0, 0);
      resultado = resultado.filter(m => {
        const fechaM = new Date(m.fecha);
        fechaM.setHours(0, 0, 0, 0);
        return fechaM <= fechaFin;
      });
    }

    return resultado.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [historial, filtroEstado, filtroFechaInicio, filtroFechaFin]);

  // Equipo seleccionado
  const equipoSeleccionado = equipos.find((e: EquipoBomberil) => e.id === equipoSeleccionadoId);

  // Auto-seleccionar primer equipo
  useEffect(() => {
    if (!equipoSeleccionadoId && equipos.length > 0) {
      setEquipoSeleccionadoId(equipos[0].id);
    }
  }, [equipos, equipoSeleccionadoId]);

  // Función para cerrar el menú
  const closeMenu = useCallback(() => {
    setMenuAbierto(null);
    setMenuPosition(null);
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    if (!menuAbierto) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.menu-dropdown') && !target.closest('.menu-button')) {
        closeMenu();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuAbierto, closeMenu]);

  // Cerrar menú al hacer scroll
  useEffect(() => {
    if (!menuAbierto) return;

    const handleScroll = () => {
      closeMenu();
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [menuAbierto, closeMenu]);

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

  const handleEditar = useCallback((mantenimiento: MantenimientoEquipo) => {
    setMantenimientoSeleccionado(mantenimiento);
    setShowEditarModal(true);
    closeMenu();
  }, [closeMenu]);

  const handleCompletar = useCallback((mantenimiento: MantenimientoEquipo) => {
    setMantenimientoSeleccionado(mantenimiento);
    setShowCompletarModal(true);
    closeMenu();
  }, [closeMenu]);

  const handleEliminar = async (mantenimiento: MantenimientoEquipo) => {
    try {
      await deleteMutation.mutateAsync({
        id: mantenimiento.id,
        equipoId: mantenimiento.equipoId,
      });
      success('Mantenimiento eliminado correctamente');
      setConfirmarEliminar(null);
      closeMenu();
    } catch (err: any) {
      console.error('Error al eliminar mantenimiento:', err);
      error(err?.message || 'Error al eliminar el mantenimiento');
    }
  };

  const handleVerDetalles = useCallback((mantenimiento: MantenimientoEquipo) => {
    setMantenimientoSeleccionado(mantenimiento);
    setShowDetallesModal(true);
    closeMenu();
  }, [closeMenu]);

  const puedeCompletar = (estado: EstadoMantenimiento) => {
    return estado === EstadoMantenimiento.PENDIENTE || estado === EstadoMantenimiento.EN_REVISION;
  };

  const toggleMenu = useCallback((id: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (menuAbierto === id) {
      closeMenu();
      return;
    }

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
  }, [menuAbierto, closeMenu]);

  const limpiarFiltros = () => {
    setFiltroEstado('');
    setFiltroFechaInicio('');
    setFiltroFechaFin('');
  };

  const hayFiltrosActivos = !!(filtroEstado || filtroFechaInicio || filtroFechaFin);

  if (isLoadingEquipos) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Cargando equipos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* SIDEBAR: Lista de Equipos */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Equipos</h3>

          {/* Búsqueda */}
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={busquedaEquipo}
                onChange={(e) => setBusquedaEquipo(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          {/* Lista de equipos */}
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {equiposFiltrados.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No se encontraron equipos
              </p>
            ) : (
              equiposFiltrados.map((equipo: EquipoBomberil) => {
                const Icon = getEquipoIcon(equipo.tipo);
                const isSelected = equipo.id === equipoSeleccionadoId;
                return (
                  <button
                    key={equipo.id}
                    onClick={() => setEquipoSeleccionadoId(equipo.id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-md transition-colors
                      flex items-center gap-2 text-sm
                      ${
                        isSelected
                          ? 'bg-red-50 text-red-900 font-medium border border-red-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{equipo.numeroSerie}</div>
                      <div className="text-xs text-gray-500 truncate">{equipo.nombre}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {getTipoEquipoLabel(equipo.tipo)}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MAIN: Historial del equipo */}
      <div className="lg:col-span-3 space-y-4">
        {!equipoSeleccionado ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Selecciona un equipo para ver su historial
            </p>
          </div>
        ) : (
          <>
            {/* Header del equipo */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                {React.createElement(getEquipoIcon(equipoSeleccionado.tipo), {
                  className: 'h-8 w-8 text-gray-600',
                })}
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {equipoSeleccionado.numeroSerie}
                  </h2>
                  <p className="text-sm font-medium text-gray-700">
                    {equipoSeleccionado.nombre}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getTipoEquipoLabel(equipoSeleccionado.tipo)}
                  </p>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
                {hayFiltrosActivos && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={limpiarFiltros}
                    className="ml-auto h-7 text-xs"
                  >
                    Limpiar
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio" className="text-xs">
                    Desde
                  </Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={filtroFechaInicio}
                    onChange={(e) => setFiltroFechaInicio(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaFin" className="text-xs">
                    Hasta
                  </Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={filtroFechaFin}
                    onChange={(e) => setFiltroFechaFin(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-xs">
                    Estado
                  </Label>
                  <Select
                    id="estado"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value as EstadoMantenimiento | '')}
                  >
                    <option value="">Todos</option>
                    <option value={EstadoMantenimiento.PENDIENTE}>Pendiente</option>
                    <option value={EstadoMantenimiento.EN_REVISION}>En Revisión</option>
                    <option value={EstadoMantenimiento.COMPLETADO}>Completado</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Lista de mantenimientos */}
            <div className="bg-white rounded-lg border border-gray-200">
              {isLoadingHistorial ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-500">Cargando historial...</p>
                  </div>
                </div>
              ) : historialFiltrado.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    {hayFiltrosActivos
                      ? 'No se encontraron mantenimientos con los filtros aplicados'
                      : 'Este equipo no tiene mantenimientos registrados'}
                  </p>
                </div>
              ) : (
                <>
                  {/* VISTA DESKTOP - Tabla */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
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
                        {historialFiltrado.map((mantenimiento) => (
                          <tr key={mantenimiento.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatFecha(mantenimiento.fecha)}
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

                  {/* VISTA MÓVIL - Cards */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {historialFiltrado.map((mantenimiento) => (
                      <div key={mantenimiento.id} className="p-4 hover:bg-gray-50 transition-colors">
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
                                className="h-7 text-xs flex-1"
                              >
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleEliminar(mantenimiento)}
                                disabled={deleteMutation.isPending}
                                className="h-7 text-xs flex-1"
                              >
                                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                              </Button>
                            </div>
                          </Alert>
                        ) : (
                          <div className="space-y-3">
                            {/* Header: Fecha y Estado */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900">
                                  {formatFecha(mantenimiento.fecha)}
                                </span>
                              </div>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoBadgeColor(
                                  mantenimiento.estado
                                )}`}
                              >
                                {getEstadoLabel(mantenimiento.estado)}
                              </span>
                            </div>

                            {/* Descripción */}
                            <div>
                              <p className="text-sm text-gray-700 break-words">
                                {mantenimiento.descripcion}
                              </p>
                            </div>

                            {/* Info adicional */}
                            <div className="text-sm">
                              <span className="text-xs text-gray-500">Técnico</span>
                              <p className="font-medium text-gray-900">{mantenimiento.tecnico || '-'}</p>
                            </div>

                            {/* Botón de acciones */}
                            <div className="pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => toggleMenu(mantenimiento.id, e)}
                                className="w-full menu-button"
                              >
                                <MoreVertical className="h-4 w-4 mr-2" />
                                Acciones
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Resumen */}
                  <div className="px-6 py-3 border-t border-gray-200 text-sm text-gray-500 text-center">
                    Mostrando {historialFiltrado.length} mantenimiento{historialFiltrado.length !== 1 ? 's' : ''}
                    {hayFiltrosActivos && ' (filtrado)'}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Portal para el menú desplegable */}
      {menuAbierto && menuPosition && createPortal(
        <div
          key={`menu-${menuAbierto}`}
          className="menu-dropdown fixed w-48 bg-white rounded-md shadow-lg border border-gray-200 z-[9999]"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            {(() => {
              const mantenimiento = historialFiltrado.find(m => m.id === menuAbierto);
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
                      closeMenu();
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
      <CompletarMantenimientoEquipoModal
        mantenimiento={mantenimientoSeleccionado}
        open={showCompletarModal}
        onOpenChange={setShowCompletarModal}
        onSuccess={() => {
          setMantenimientoSeleccionado(null);
        }}
      />

      <DetallesMantenimientoEquipoModal
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

      <RegistrarMantenimientoModal
        open={showRegistrarModal}
        onOpenChange={setShowRegistrarModal}
        onSuccess={() => {
          // Se actualiza automáticamente
        }}
      />

      <ProgramarMantenimientoModal
        open={showProgramarModal}
        onOpenChange={setShowProgramarModal}
        onSuccess={() => {
          // Se actualiza automáticamente
        }}
      />
    </div>
  );
};