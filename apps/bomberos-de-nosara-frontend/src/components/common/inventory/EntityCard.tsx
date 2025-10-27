import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Eye, Pencil, ArrowRightLeft } from 'lucide-react';

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
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardContent className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Icono opcional */}
            {icon && (
              <div className="rounded-lg bg-gray-100 p-1.5 sm:p-2 mt-0.5 sm:mt-1 flex-shrink-0">
                {icon}
              </div>
            )}
            
            {/* Título y subtítulo */}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Badge de estado */}
          <Badge 
            variant="outline" 
            className={`${status.colorClasses} text-xs whitespace-nowrap ml-2 flex-shrink-0`}
          >
            {status.label}
          </Badge>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
          {metadata.map((item, index) => (
            <div key={index} className="min-w-0">
              <p className="text-xs text-gray-500 mb-0.5 truncate">
                {item.label}
              </p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Actions - Responsive según breakpoint */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-auto">
          {/* Desktop: Botones con texto */}
          <div className="hidden sm:flex items-center gap-2 w-full">
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
                title="Cambiar estado"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Mobile: Solo iconos con tooltips */}
          <div className="flex sm:hidden items-center gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
              className="flex-1"
              title="Ver detalles"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex-1"
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {onChangeStatus && (
              <Button
                variant="outline"
                size="sm"
                onClick={onChangeStatus}
                className="flex-1"
                title="Cambiar estado"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );}