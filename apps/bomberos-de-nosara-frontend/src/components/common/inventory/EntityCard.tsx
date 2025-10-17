import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Eye, Pencil, ArrowRightLeft, MoreVertical } from 'lucide-react';

interface EntityCardProps {
  id: string;
  title: string;        // placa (vehículo) o nombre (equipo)
  subtitle: string;     // tipo de vehículo o tipo de equipo
  icon?: React.ReactNode; // Icono del tipo de entidad
  status: {
    label: string;
    colorClasses: string; 
  };
  metadata: Array<{
    label: string;
    value: string;
  }>;
  onView: () => void;
  onEdit: () => void;
  onChangeStatus?: () => void;
}

export const EntityCard: React.FC<EntityCardProps> = ({
  title,
  subtitle,
  icon,
  status,
  metadata,
  onView,
  onEdit,
  onChangeStatus,
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            {/* Icono opcional */}
            {icon && (
              <div className="rounded-lg bg-gray-100 p-2 mt-1">
                {icon}
              </div>
            )}
            
            {/* Título y subtítulo */}
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {title}
              </h3>
              <p className="text-sm text-gray-500">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Badge de estado */}
          <Badge variant="outline" className={status.colorClasses}>
            {status.label}
          </Badge>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {metadata.map((item, index) => (
            <div key={index}>
              <p className="text-xs text-gray-500 mb-0.5">
                {item.label}
              </p>
              <p className="text-sm font-medium text-gray-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Ver detalles
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1"
          >
            <Pencil className="h-4 w-4 mr-1.5" />
            Editar
          </Button>

          {onChangeStatus && (
            <Button
              variant="outline"
              size="sm"
              onClick={onChangeStatus}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};