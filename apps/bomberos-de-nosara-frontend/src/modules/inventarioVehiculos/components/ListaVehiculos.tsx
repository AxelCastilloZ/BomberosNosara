// src/modules/inventarioVehiculos/components/ListaVehiculos.tsx

import React, { useState } from 'react';
import { Plus, Truck } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { EntityFilters } from '../../../components/common/inventory/EntityFilters';
import { EmptyState } from '../../../components/common/inventory/EmptyState';
import { VehiculoCard } from './VehiculoCard';
import { useVehiculosPaginated } from '../hooks/useVehiculos';
import { CrearVehiculoModal } from './modals/CrearVehiculoModal';
import { DetallesVehiculoModal } from './modals/DetallesVehiculoModal';
import { CambiarEstadoModal } from './modals/CambiarEstadoModal';
import { EditarVehiculoModal } from './modals/EditarVehiculoModal';
import type { Vehiculo, EstadoVehiculo, TipoVehiculo } from '../../../types/vehiculo.types';
import { 
  ESTADO_VEHICULO_OPTIONS, 
  TIPO_VEHICULO_OPTIONS 
} from '../utils/vehiculoHelpers';

export const ListaVehiculos: React.FC = () => {
  // Estados de filtros
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EstadoVehiculo | ''>('');
  const [type, setType] = useState<TipoVehiculo | ''>('');

  // Estados de modales
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Query de vehículos con filtros y paginación
  const { data: response, isLoading } = useVehiculosPaginated({
    search: search || undefined,
    status: status || undefined,
    type: type || undefined,
    page: 1,
    limit: 100,
  });

  // Extraer vehículos del response paginado
  const vehiculos = response?.data || [];

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setType('');
  };

  const hasActiveFilters = search !== '' || status !== '' || type !== '';

  const handleView = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setShowDetailsModal(true);
  };

  const handleEdit = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setShowEditModal(true);
  };

  const handleChangeStatus = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setShowStatusModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Cargando vehículos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header con título y botón - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            Vehículos
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Administra la flota de vehículos de bomberos
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto flex-shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar vehículo
        </Button>
      </div>

      {/* Filtros */}
      <EntityFilters
        searchPlaceholder="Buscar por placa..."
        searchValue={search}
        onSearchChange={setSearch}
        statusValue={status}
        statusOptions={ESTADO_VEHICULO_OPTIONS}
        onStatusChange={(value) => setStatus(value as EstadoVehiculo | '')}
        typeValue={type}
        typeOptions={TIPO_VEHICULO_OPTIONS}
        onTypeChange={(value) => setType(value as TipoVehiculo | '')}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Lista de vehículos o estado vacío */}
      {vehiculos.length === 0 ? (
        <EmptyState
          icon={Truck}
          title={
            hasActiveFilters
              ? 'No se encontraron vehículos'
              : 'No hay vehículos registrados'
          }
          description={
            hasActiveFilters
              ? 'Intenta con otros filtros de búsqueda'
              : 'Comienza agregando el primer vehículo de la flota'
          }
          action={
            !hasActiveFilters
              ? {
                  label: 'Agregar vehículo',
                  onClick: () => setShowCreateModal(true),
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {vehiculos.map((vehiculo) => (
            <VehiculoCard
              key={vehiculo.id}
              vehiculo={vehiculo}
              onView={handleView}
              onEdit={handleEdit}
              onChangeStatus={handleChangeStatus}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <CrearVehiculoModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />

      <DetallesVehiculoModal 
        vehiculo={selectedVehiculo}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />

      <CambiarEstadoModal 
        vehiculo={selectedVehiculo}
        open={showStatusModal}
        onOpenChange={setShowStatusModal}
      />

      <EditarVehiculoModal 
        vehiculo={selectedVehiculo}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />
    </div>
  );
};