// src/modules/inventarioVehiculos/components/ScheduleMaintenance.tsx
import React, { useEffect, useState } from 'react';

// Types globales
import type { Vehicle } from '../../../types/vehiculo.types';

// Types del módulo
import type { ScheduleMaintenanceProps } from '../types';

// Hooks del módulo
import { useVehiculos, useProgramarMantenimiento } from '../hooks/useVehiculos';

// Sistema de notificaciones
import { useCrudNotifications } from '../../../hooks/useCrudNotifications';

export default function ScheduleMaintenance({ vehiculoId, fechaActual, onClose }: ScheduleMaintenanceProps) {
  const { data: vehicles = [] } = useVehiculos();
  const programarMantenimiento = useProgramarMantenimiento();
  const { notifyCreated, notifyError } = useCrudNotifications();

  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehicle | undefined>(undefined);

  useEffect(() => {
    if (!vehiculoSeleccionado && vehiculoId && vehicles.length) {
      const found = vehicles.find((v) => v.id === vehiculoId);
      if (found) setVehiculoSeleccionado(found);
    }
  }, [vehiculoId, vehicles, vehiculoSeleccionado]);

  const [fecha, setFecha] = useState<string>(fechaActual ?? '');
  const [tecnico, setTecnico] = useState<string>('');
  const [tipo, setTipo] = useState<'preventivo' | 'correctivo' | 'inspección'>('preventivo');
  const [prioridad, setPrioridad] = useState<'baja' | 'media' | 'alta'>('media');
  const [observaciones, setObservaciones] = useState<string>('');

  const isDisabled = !vehiculoSeleccionado || !fecha || !tecnico;

  const handleSubmit = () => {
    if (isDisabled) return;

    programarMantenimiento.mutate(
      {
        id: vehiculoSeleccionado!.id,
        data: {
          fechaProximoMantenimiento: fecha,
          tecnico,
          tipo,
          prioridad,
          observaciones,
        },
      },
      { 
        onSuccess: () => {
          notifyCreated('Mantenimiento programado');
          onClose();
        },
        onError: (error: any) => {
          const message = error?.message || 'Error al programar mantenimiento';
          notifyError('programar mantenimiento', message);
        }
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-1 text-gray-800">Programar mantenimiento</h2>
      <p className="text-sm text-gray-500 mb-6">
        Completa los detalles para agendar un próximo mantenimiento
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna 1 */}
        <div className="space-y-4">
          {!vehiculoSeleccionado && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Seleccionar vehículo</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2"
                onChange={(e) =>
                  setVehiculoSeleccionado(vehicles.find((v) => v.id === e.target.value))
                }
                defaultValue=""
              >
                <option value="" disabled>-- Seleccione --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} - {v.tipo}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Técnico responsable</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={tecnico}
              onChange={(e) => setTecnico(e.target.value)}
              placeholder="Nombre del técnico"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de mantenimiento</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as typeof tipo)}
            >
              <option value="preventivo">Preventivo</option>
              <option value="correctivo">Correctivo</option>
              <option value="inspección">Inspección</option>
            </select>
          </div>
        </div>

        {/* Columna 2 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de mantenimiento</label>
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Prioridad</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as typeof prioridad)}
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Observaciones (opcional)</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas adicionales..."
            />
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={isDisabled || programarMantenimiento.isPending}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {programarMantenimiento.isPending ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}