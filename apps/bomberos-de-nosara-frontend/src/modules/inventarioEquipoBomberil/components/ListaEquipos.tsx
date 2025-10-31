


import React, { useState } from 'react';
import { Plus, Wrench } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { EntityFilters } from '../../../components/common/inventory/EntityFilters';
import { EmptyState } from '../../../components/common/inventory/EmptyState';
import { EquipoCard } from './EquipoCard';
import { useEquiposPaginated } from '../hooks/useEquipos';
import { CrearEquipoModal } from './modals/CrearEquipoModal';
import { DetallesEquipoModal } from './modals/DetallesEquipoModal';
import { CambiarEstadoModal } from './modals/CambiarEstadoModal';
import { EditarEquipoModal } from './modals/EditarEquipoModal';
import type { EquipoBomberil, EstadoEquipo, TipoEquipo } from '../../../types/equipoBomberil.types';
import { 
  ESTADO_EQUIPO_OPTIONS, 
  TIPO_EQUIPO_OPTIONS 
} from '../utils/equipoBomberilHelpers';

export const ListaEquipos: React.FC = () => {
  // Estados de filtros
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EstadoEquipo | ''>('');
  const [type, setType] = useState<TipoEquipo | ''>('');

  // Estados de modales
  const [selectedEquipo, setSelectedEquipo] = useState<EquipoBomberil | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Query de equipos con filtros y paginación
  const { data: response, isLoading } = useEquiposPaginated({
    search: search || undefined,
    status: status || undefined,
    type: type || undefined,
    page: 1,
    limit: 100,
  });

  // Extraer equipos del response paginado
  const equipos = response?.data || [];

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setType('');
  };

  const hasActiveFilters = search !== '' || status !== '' || type !== '';

  const handleView = (equipo: EquipoBomberil) => {
    setSelectedEquipo(equipo);
    setShowDetailsModal(true);
  };

  const handleEdit = (equipo: EquipoBomberil) => {
    setSelectedEquipo(equipo);
    setShowEditModal(true);
  };

  const handleChangeStatus = (equipo: EquipoBomberil) => {
    setSelectedEquipo(equipo);
    setShowStatusModal(true);
  };

  if (isLoading) {
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
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header con título y botón - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            Equipos Bomberiles
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Administra el inventario de equipos de bomberos
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto flex-shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar equipo
        </Button>
      </div>

      {/* Filtros */}
      <EntityFilters
        searchPlaceholder="Buscar por número de serie o nombre..."
        searchValue={search}
        onSearchChange={setSearch}
        statusValue={status}
        statusOptions={ESTADO_EQUIPO_OPTIONS}
        onStatusChange={(value) => setStatus(value as EstadoEquipo | '')}
        typeValue={type}
        typeOptions={TIPO_EQUIPO_OPTIONS}
        onTypeChange={(value) => setType(value as TipoEquipo | '')}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Lista de equipos o estado vacío */}
      {equipos.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title={
            hasActiveFilters
              ? 'No se encontraron equipos'
              : 'No hay equipos registrados'
          }
          description={
            hasActiveFilters
              ? 'Intenta con otros filtros de búsqueda'
              : 'Comienza agregando el primer equipo al inventario'
          }
          action={
            !hasActiveFilters
              ? {
                  label: 'Agregar equipo',
                  onClick: () => setShowCreateModal(true),
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {equipos.map((equipo) => (
            <EquipoCard
              key={equipo.id}
              equipo={equipo}
              onView={handleView}
              onEdit={handleEdit}
              onChangeStatus={handleChangeStatus}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <CrearEquipoModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />

      <DetallesEquipoModal 
        equipo={selectedEquipo}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />

      <CambiarEstadoModal 
        equipo={selectedEquipo}
        open={showStatusModal}
        onOpenChange={setShowStatusModal}
      />

      <EditarEquipoModal 
        equipo={selectedEquipo}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />
    </div>
  );
};