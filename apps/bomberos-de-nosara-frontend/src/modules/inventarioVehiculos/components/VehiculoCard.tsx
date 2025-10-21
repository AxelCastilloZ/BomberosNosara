import React from 'react';
import { EntityCard } from '../../../components/common/inventory/EntityCard';
import { Vehiculo } from '../../../types/vehiculo.types';
import {
  getVehiculoIcon,
  getEstadoVehiculoColor,
  getEstadoVehiculoLabel,
  getTipoVehiculoLabel,
  formatKilometraje,
  formatFechaCorta,
} from '../utils/vehiculoHelpers';

interface VehiculoCardProps {
  vehiculo: Vehiculo;
  onView: (vehiculo: Vehiculo) => void;
  onEdit: (vehiculo: Vehiculo) => void;
  onChangeStatus: (vehiculo: Vehiculo) => void;
}

export const VehiculoCard: React.FC<VehiculoCardProps> = ({
  vehiculo,
  onView,
  onEdit,
  onChangeStatus,
}) => {
  const Icon = getVehiculoIcon(vehiculo.tipo);

  return (
    <EntityCard
      id={vehiculo.id}
      title={vehiculo.placa}
      subtitle={getTipoVehiculoLabel(vehiculo.tipo)}
      icon={<Icon className="h-5 w-5 text-gray-600" />}
      status={{
        label: getEstadoVehiculoLabel(vehiculo.estadoActual),
        colorClasses: getEstadoVehiculoColor(vehiculo.estadoActual),
      }}
      metadata={[
        {
          label: 'Adquisición',
          value: formatFechaCorta(vehiculo.fechaAdquisicion),
        },
        {
          label: 'Kilometraje',
          value: formatKilometraje(vehiculo.kilometraje),
        },
      ]}
      onView={() => onView(vehiculo)}
      onEdit={() => onEdit(vehiculo)}
      onChangeStatus={() => onChangeStatus(vehiculo)}
    />
  );
};