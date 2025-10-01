import React, { useState } from 'react';
import type { NotifyReplacementProps } from '../types';
import { useVehiculos, useRegistrarReposicionVehiculo } from '../hooks/useVehiculos';
import { useCrudNotifications } from '../../../hooks/useCrudNotifications';

export default function NotifyReplacement({ vehiculoId, onClose }: NotifyReplacementProps) {
  const { data: vehicles = [] } = useVehiculos();
  const registrarReposicion = useRegistrarReposicionVehiculo();
  const { notifyError } = useCrudNotifications();

  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<string | undefined>(vehiculoId);
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const isDisabled = !vehiculoSeleccionado || !motivo.trim();

  const handleSubmit = () => {
    if (isDisabled) return;

    registrarReposicion.mutate(
      {
        id: vehiculoSeleccionado!,
        data: { motivo, observaciones },
      },
      {
        onSuccess: () => {
          // Mostrar notificación de éxito (puedes personalizarla)
          onClose();
        },
        onError: (error: any) => {
          const message = error?.message || 'Error al solicitar reposición';
          notifyError('solicitar reposición', message);
        },
      }
    );
  };

  return (
    <div className="bg-white border border-gray-300 shadow rounded-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">Solicitar Reposición</h2>
      <p className="text-sm text-gray-500 mb-6">
        Completa los datos para notificar una solicitud de reposición del vehículo
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!vehiculoId && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar vehículo</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              onChange={(e) => setVehiculoSeleccionado(e.target.value)}
              value={vehiculoSeleccionado ?? ''}
            >
              <option value="" disabled>
                -- Seleccione --
              </option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} - {v.tipo}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej: Vehículo inoperable, daños irreparables..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
            placeholder="Notas adicionales sobre la situación"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={isDisabled || registrarReposicion.isPending}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {registrarReposicion.isPending ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}