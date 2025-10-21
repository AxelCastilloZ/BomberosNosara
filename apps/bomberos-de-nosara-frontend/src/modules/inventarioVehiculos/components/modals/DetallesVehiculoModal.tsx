// src/modules/inventarioVehiculos/components/modals/DetallesVehiculoModal.tsx

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { 
  History, 
  Calendar, 
  Gauge,
  Package,
  AlertCircle,
} from 'lucide-react';
import type { DetallesVehiculoProps } from '../../types';
import {
  getVehiculoIcon,
  getTipoVehiculoLabel,
  getEstadoVehiculoLabel,
  getEstadoVehiculoColor,
  formatKilometraje,
  formatFecha,
} from '../../utils/vehiculoHelpers';

export const DetallesVehiculoModal: React.FC<DetallesVehiculoProps> = ({
  vehiculo,
  open,
  onOpenChange,
}) => {
  // Si no hay vehículo seleccionado, no renderizar
  if (!vehiculo) return null;

  const VehiculoIcon = getVehiculoIcon(vehiculo.tipo);
  const estadoColor = getEstadoVehiculoColor(vehiculo.estadoActual);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[95vw] max-w-3xl"
        style={{ 
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: 0
        }}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <VehiculoIcon className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle>
                  {vehiculo.placa}
                </DialogTitle>
                <DialogDescription>
                  {getTipoVehiculoLabel(vehiculo.tipo)}
                </DialogDescription>
              </div>
            </div>
            <Badge className={estadoColor}>
              {getEstadoVehiculoLabel(vehiculo.estadoActual)}
            </Badge>
          </div>
        </DialogHeader>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto px-6 flex-1">
          <div className="space-y-6 py-4">
            {/* Información General */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Información General
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <InfoCard
                  icon={<Gauge className="h-4 w-4" />}
                  label="Kilometraje"
                  value={formatKilometraje(vehiculo.kilometraje)}
                />
                <InfoCard
                  icon={<Calendar className="h-4 w-4" />}
                  label="Fecha de adquisición"
                  value={formatFecha(vehiculo.fechaAdquisicion)}
                />
                <InfoCard
                  label="Estado inicial"
                  value={vehiculo.estadoInicial === 'nuevo' ? 'Nuevo' : 'Usado'}
                />
                <InfoCard
                  label="Estado actual"
                  value={getEstadoVehiculoLabel(vehiculo.estadoActual)}
                />
              </div>
            </section>

            {/* LOG AUTOMÁTICO - CARACTERÍSTICA PRINCIPAL */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <History className="h-4 w-4" />
                Historial del Vehículo
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                {vehiculo.observaciones ? (
                  <div className="bg-white rounded border border-gray-200 p-3 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-700 font-mono whitespace-pre-line leading-relaxed">
                      {vehiculo.observaciones}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-white rounded border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 italic text-center">
                      Sin eventos registrados aún
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-3 italic flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Este historial se actualiza automáticamente
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ==================== COMPONENTE AUXILIAR ====================

interface InfoCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-3">
    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <p className="text-sm font-semibold text-gray-900">{value}</p>
  </div>
);