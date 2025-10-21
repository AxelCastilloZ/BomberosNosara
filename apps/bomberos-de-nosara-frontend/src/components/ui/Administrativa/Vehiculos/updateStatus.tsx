import React, { useState } from 'react';
import { Vehicle, EstadoVehiculo } from '../../../../interfaces/Vehiculos/vehicle';
import { useVehiculos, useActualizarEstadoVehiculo, useDarDeBajaVehiculo } from '../../../../hooks/useVehiculos';

interface Props {
  vehiculo?: Vehicle;
  onClose: () => void;
}

const estadosDisponibles = [
  {
    estado: 'activo',
    titulo: 'Disponible',
    descripcion: 'Vehículo listo para operaciones',
    clases: 'bg-green-50 border-green-600 hover:border-green-500',
    punto: 'bg-green-600',
  },
  {
    estado: 'en mantenimiento',
    titulo: 'En mantenimiento',
    descripcion: 'Mantenimiento preventivo o correctivo',
    clases: 'bg-amber-50 border-amber-600 hover:border-amber-500',
    punto: 'bg-amber-500',
  },
  {
    estado: 'dado de baja',
    titulo: 'Dado de baja',
    descripcion: 'Fuera de servicio permanente',
    clases: 'bg-gray-50 border-gray-600 hover:border-gray-500',
    punto: 'bg-red-600',
  },
];

export default function UpdateStatus({ vehiculo, onClose }: Props) {
  const { data: vehicles = [] } = useVehiculos();
  const actualizarEstado = useActualizarEstadoVehiculo();
  const darDeBaja = useDarDeBajaVehiculo();

  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehicle | undefined>(vehiculo);
  const [estado, setEstado] = useState<EstadoVehiculo | ''>(vehiculo?.estadoActual || '');
  const [motivo, setMotivo] = useState<string>('');

  const handleSubmit = () => {
    if (!vehiculoSeleccionado || !estado) return;

    if (estado === 'dado de baja') {
      if (!motivo.trim()) return; // evita enviar sin motivo
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
      <p className="text-sm text-gray-500 mb-6">Cambia el estado operativo de cualquier vehículo del sistema</p>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {estadosDisponibles.map(({ estado: e, titulo, descripcion, clases, punto }) => {
                const selected = estado === e;
                return (
                  <button
                    key={e}
                    type="button"
                    className={`border rounded-lg p-4 text-left transition-all duration-150 ${
                      selected ? `border-2 ${clases}` : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setEstado(e as EstadoVehiculo)}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${punto}`}></span>
                      <span className="font-semibold text-sm">{titulo}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{descripcion}</p>
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
                  : 'Observaciones importantes...'
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
