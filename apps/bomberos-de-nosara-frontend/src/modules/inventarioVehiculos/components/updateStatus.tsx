import React, { useState, useMemo } from 'react';
import type { Vehicle, EstadoVehiculo } from '../../../types/vehiculo.types';
import type { UpdateStatusProps } from '../types';
import { useVehiculos, useActualizarEstadoVehiculo, useDarDeBajaVehiculo } from '../hooks/useVehiculos';
import { ESTADOS_DISPONIBLES } from '../utils/vehiculoConstants';

export default function UpdateStatus({ vehiculo, onClose }: UpdateStatusProps) {
  const { data: vehiclesResponse = [] } = useVehiculos();
  const actualizarEstado = useActualizarEstadoVehiculo();
  const darDeBaja = useDarDeBajaVehiculo();

  // Extraer el array de vehículos correctamente
  const vehicles: Vehicle[] = useMemo(() => {
    if (Array.isArray(vehiclesResponse)) {
      return vehiclesResponse;
    }
    if (vehiclesResponse && 'data' in vehiclesResponse) {
      return vehiclesResponse.data;
    }
    return [];
  }, [vehiclesResponse]);

  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehicle | undefined>(vehiculo);
  const [estado, setEstado] = useState<EstadoVehiculo | ''>(vehiculo?.estadoActual || '');
  const [motivo, setMotivo] = useState<string>('');

  const handleSubmit = () => {
    if (!vehiculoSeleccionado || !estado) return;

    if (estado === 'dado de baja') {
      if (!motivo.trim()) return;
      darDeBaja.mutate(
        { id: vehiculoSeleccionado.id, motivo },
        { onSuccess: () => onClose() }
      );
    } else {
      actualizarEstado.mutate(
        { id: vehiculoSeleccionado.id, estadoActual: estado },
        { onSuccess: () => onClose() }
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-1 text-gray-800">Actualizar estado de vehículo</h2>
      <p className="text-sm text-gray-500 mb-6">Cambia el estado operativo del vehículo</p>

      {!vehiculoSeleccionado && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Seleccionar vehículo</label>
          <select
            className="w-full border rounded px-3 py-2"
            onChange={(e) => {
              const selected = vehicles.find((v) => v.id === e.target.value);
              setVehiculoSeleccionado(selected);
            }}
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

      {vehiculoSeleccionado && (
        <>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nuevo estado</label>
            <div className="grid grid-cols-2 gap-3">
              {ESTADOS_DISPONIBLES.map(({ estado: e, titulo, descripcion, color, punto }) => {
                const selected = estado === e;
                return (
                  <button
                    key={e}
                    type="button"
                    className={`border-2 rounded-lg p-3 text-left transition-all ${
                      selected ? color : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setEstado(e)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${punto}`}></span>
                      <span className="font-medium text-sm">{titulo}</span>
                    </div>
                    <p className="text-xs text-gray-500">{descripcion}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {estado === 'dado de baja' ? 'Motivo (requerido)' : 'Notas adicionales (opcional)'}
            </label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              placeholder={
                estado === 'dado de baja'
                  ? 'Describe el motivo del retiro permanente...'
                  : 'Observaciones...'
              }
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!estado || (estado === 'dado de baja' && !motivo.trim()) || actualizarEstado.isPending || darDeBaja.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {actualizarEstado.isPending || darDeBaja.isPending ? 'Guardando…' : 'Actualizar estado'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}