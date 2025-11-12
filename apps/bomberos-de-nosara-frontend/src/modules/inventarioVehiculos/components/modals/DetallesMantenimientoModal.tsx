// src/modules/inventarioVehiculos/components/modals/DetallesMantenimientoModal.tsx

import React from 'react';
import { BaseModal } from '../../../../components/ui/base-modal';
import { Button } from '../../../../components/ui/button';
import { Calendar, Wrench, User, DollarSign, Gauge, FileText } from 'lucide-react';
import { useVehiculoComplete } from '../../hooks/useVehiculos';
import { getTipoVehiculoLabel, formatKilometraje, getEstadoVehiculoLabel } from '../../utils/vehiculoHelpers';
import type { DetallesMantenimientoModalProps } from '../../types';

// Helper para formatear fecha
const formatFecha = (fechaStr: string) => {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-CR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Helper para formatear costo en dólares
const formatCostoDolares = (costo: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(costo);
};

// Helper para el badge de estado
const getEstadoBadge = (estado: string) => {
  const badges: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    en_revision: 'bg-blue-100 text-blue-800 border-blue-300',
    completado: 'bg-green-100 text-green-800 border-green-300',
  };
  return badges[estado] || 'bg-gray-100 text-gray-800 border-gray-300';
};

const getEstadoLabel = (estado: string) => {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    en_revision: 'En Revisión',
    completado: 'Completado',
  };
  return labels[estado] || estado;
};

// ==================== COMPONENT ====================

export const DetallesMantenimientoModal: React.FC<DetallesMantenimientoModalProps> = ({
  mantenimiento,
  open,
  onOpenChange,
}) => {
  // Query para obtener info del vehículo (incluyendo eliminados)
  const { data: vehiculo, isLoading: isLoadingVehiculo } = useVehiculoComplete(mantenimiento?.vehiculoId);

  if (!mantenimiento) {
    return null;
  }

  const handleClose = () => {
    onOpenChange(false);
  };

  // Footer content con botón cerrar
  const footerContent = (
    <Button onClick={handleClose}>Cerrar</Button>
  );

  return (
    <BaseModal
      open={open}
      onOpenChange={handleClose}
      title="Detalles del Mantenimiento"
      description="Información completa del registro de mantenimiento"
      size="xl"
      footerContent={footerContent}
    >
      {isLoadingVehiculo ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Cargando información...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Información del Vehículo */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              🚗 Información del Vehículo
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Placa</p>
                  <p className="text-sm font-medium text-gray-900">
                    {vehiculo?.placa || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tipo de Vehículo</p>
                  <p className="text-sm font-medium text-gray-900">
                    {vehiculo ? getTipoVehiculoLabel(vehiculo.tipo) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estado Actual del Vehículo</p>
                  <p className="text-sm font-medium text-gray-900">
                    {vehiculo ? getEstadoVehiculoLabel(vehiculo.estadoActual) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Kilometraje Actual</p>
                  <p className="text-sm font-medium text-gray-900">
                    {vehiculo ? formatKilometraje(vehiculo.kilometraje) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles del Mantenimiento */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              🔧 Detalles del Mantenimiento
            </h3>
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="divide-y divide-gray-200">
                {/* Fecha */}
                <div className="p-4 flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Fecha del Mantenimiento</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatFecha(mantenimiento.fecha)}
                    </p>
                  </div>
                </div>

                {/* Descripción */}
                <div className="p-4 flex items-start gap-3">
                  <Wrench className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Descripción</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mantenimiento.descripcion}
                    </p>
                  </div>
                </div>

                {/* Técnico */}
                <div className="p-4 flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Técnico Responsable</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mantenimiento.tecnico || '-'}
                    </p>
                  </div>
                </div>

                {/* Kilometraje */}
                <div className="p-4 flex items-start gap-3">
                  <Gauge className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Kilometraje al Momento del Mantenimiento</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mantenimiento.kilometraje ? formatKilometraje(mantenimiento.kilometraje) : '-'}
                    </p>
                  </div>
                </div>

                {/* Costo */}
                <div className="p-4 flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Costo Total</p>
                    <p className="text-sm font-medium text-gray-900">
                      {mantenimiento.costo !== null && mantenimiento.costo !== undefined 
                        ? formatCostoDolares(mantenimiento.costo) 
                        : '-'}
                    </p>
                  </div>
                </div>

                {/* Estado */}
                <div className="p-4 flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Estado</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoBadge(
                        mantenimiento.estado
                      )}`}
                    >
                      {getEstadoLabel(mantenimiento.estado)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {mantenimiento.observaciones && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                📝 Observaciones
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {mantenimiento.observaciones}
                </p>
              </div>
            </div>
          )}

          {/* Auditoría */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              📋 Información de Registro
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-500">Creado el</p>
                  <p className="font-medium text-gray-900">
                    {formatFecha(mantenimiento.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Última actualización</p>
                  <p className="font-medium text-gray-900">
                    {formatFecha(mantenimiento.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </BaseModal>
  );
};