// src/modules/inventarioEquipos/components/modals/DetallesEquipoModal.tsx

import React from 'react';
import { BaseModal } from '../../../../components/ui/base-modal';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { 
  History, 
  Calendar, 
  Package,
  AlertCircle,
} from 'lucide-react';
import type { DetallesEquipoProps } from '../../types';
import {
  getEquipoIcon,
  getTipoEquipoLabel,
  getEstadoEquipoLabel,
  getEstadoEquipoColor,
  formatFecha,
} from '../../utils/equipoBomberilHelpers';

export const DetallesEquipoModal: React.FC<DetallesEquipoProps> = ({
  equipo,
  open,
  onOpenChange,
}) => {
  // Si no hay equipo seleccionado, no renderizar
  if (!equipo) return null;

  const EquipoIcon = getEquipoIcon(equipo.tipo);
  const estadoColor = getEstadoEquipoColor(equipo.estadoActual);

  // Footer content
  const footerContent = (
    <Button variant="outline" onClick={() => onOpenChange(false)}>
      Cerrar
    </Button>
  );

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      footerContent={footerContent}
    >
      {/* Custom Header */}
      <div className="pb-4 mb-6 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <EquipoIcon className="h-6 w-6 text-gray-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-none tracking-tight">
                {equipo.nombre}
              </h2>
              <p className="text-sm text-gray-500 mt-1.5">
                {equipo.numeroSerie} • {getTipoEquipoLabel(equipo.tipo)}
              </p>
            </div>
          </div>
          <Badge className={estadoColor}>
            {getEstadoEquipoLabel(equipo.estadoActual)}
          </Badge>
        </div>
      </div>

      {/* Contenido */}
      <div className="space-y-6">
        {/* Información General */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Información General
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              icon={<Calendar className="h-4 w-4" />}
              label="Fecha de adquisición"
              value={formatFecha(equipo.fechaAdquisicion)}
            />
            <InfoCard
              label="Estado inicial"
              value={equipo.estadoInicial === 'nuevo' ? 'Nuevo' : 'Usado'}
            />
            <InfoCard
              label="Tipo de equipo"
              value={getTipoEquipoLabel(equipo.tipo)}
            />
            <InfoCard
              label="Estado actual"
              value={getEstadoEquipoLabel(equipo.estadoActual)}
            />
          </div>
        </section>

        {/* LOG AUTOMÁTICO - CARACTERÍSTICA PRINCIPAL */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <History className="h-4 w-4" />
            Historial del Equipo
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            {equipo.observaciones ? (
              <div className="bg-white rounded border border-gray-200 p-3 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 font-mono whitespace-pre-line leading-relaxed">
                  {equipo.observaciones}
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
    </BaseModal>
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