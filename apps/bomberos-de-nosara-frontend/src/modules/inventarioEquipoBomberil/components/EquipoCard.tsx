// src/modules/inventarioEquipos/components/EquipoCard.tsx

import React from 'react';
import { EntityCard } from '../../../components/common/inventory/EntityCard';
import { EquipoBomberil } from '../../../types/equipoBomberil.types';
import {
  getEquipoIcon,
  getEstadoEquipoColor,
  getEstadoEquipoLabel,
  getTipoEquipoLabel,
  formatFechaCorta,
} from '../utils/equipoBomberilHelpers';

interface EquipoCardProps {
  equipo: EquipoBomberil;
  onView: (equipo: EquipoBomberil) => void;
  onEdit: (equipo: EquipoBomberil) => void;
  onChangeStatus: (equipo: EquipoBomberil) => void;
}

export const EquipoCard: React.FC<EquipoCardProps> = ({
  equipo,
  onView,
  onEdit,
  onChangeStatus,
}) => {
  const Icon = getEquipoIcon(equipo.tipo);

  return (
    <EntityCard
      id={equipo.id}
      title={equipo.nombre}
      subtitle={`${equipo.numeroSerie} • ${getTipoEquipoLabel(equipo.tipo)}`}
      icon={<Icon className="h-5 w-5 text-gray-600" />}
      status={{
        label: getEstadoEquipoLabel(equipo.estadoActual),
        colorClasses: getEstadoEquipoColor(equipo.estadoActual),
      }}
      metadata={[
        {
          label: 'Adquisición',
          value: formatFechaCorta(equipo.fechaAdquisicion),
        },
        {
          label: 'Estado inicial',
          value: equipo.estadoInicial === 'nuevo' ? 'Nuevo' : 'Usado',
        },
      ]}
      onView={() => onView(equipo)}
      onEdit={() => onEdit(equipo)}
      onChangeStatus={() => onChangeStatus(equipo)}
    />
  );
};