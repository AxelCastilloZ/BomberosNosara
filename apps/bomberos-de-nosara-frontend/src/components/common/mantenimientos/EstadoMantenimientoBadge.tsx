import React from 'react';
import { Badge } from '../../../components/ui/badge';
import { EstadoMantenimiento } from '../../../types/mantenimiento.types';
import { 
  getEstadoMantenimientoColor, 
  getEstadoMantenimientoLabel 
} from '../../../modules/inventarioVehiculos/utils/vehiculoHelpers';

interface EstadoMantenimientoBadgeProps {
  estado: EstadoMantenimiento;
  className?: string;
}

export const EstadoMantenimientoBadge: React.FC<EstadoMantenimientoBadgeProps> = ({ 
  estado,
  className = '' 
}) => {
  const colorClasses = getEstadoMantenimientoColor(estado);
  const label = getEstadoMantenimientoLabel(estado);

  return (
    <Badge 
      variant="outline" 
      className={`${colorClasses} ${className}`}
    >
      {label}
    </Badge>
  );
};