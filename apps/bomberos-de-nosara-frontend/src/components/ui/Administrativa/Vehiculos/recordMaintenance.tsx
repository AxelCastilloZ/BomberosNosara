import React, { useState } from 'react';
import { useVehiculos, useRegistrarMantenimiento } from '../../../../hooks/useVehiculos';

interface Props {
  vehiculoId?: string;
  onClose: () => void;
}

export default function RecordMaintenance({ vehiculoId, onClose }: Props) {
  const { data: vehicles = [] } = useVehiculos();
  const registrarMantenimiento = useRegistrarMantenimiento();

  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<string | undefined>(vehiculoId);
  const [fecha, setFecha] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [kilometraje, setKilometraje] = useState<number | ''>('');
  const [tecnico, setTecnico] = useState('');
  const [costo, setCosto] = useState<number | ''>('');
  const [observaciones, setObservaciones] = useState('');

  const isDisabled =
    !vehiculoSeleccionado || !fecha || !descripcion || kilometraje === '' || !tecnico || costo === '';

  const handleSubmit = () => {
    if (isDisabled) return;

    registrarMantenimiento.mutate(
      {
        id: vehiculoSeleccionado!,
        data: {
          fecha,
          descripcion,
          kilometraje: Number(kilometraje),
          tecnico,
          costo: Number(costo),
          observaciones,
        },
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <div className="bg-white border border-gray-300 shadow rounded-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">Registrar mantenimiento</h2>
      <p className="text-sm text-gray-500 mb-6">Completa los datos para registrar un mantenimiento realizado</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar vehículo</label>
          <select
            className="w-full border rounded px-3 py-2"
            onChange={(e) => setVehiculoSeleccionado(e.target.value)}
            value={vehiculoSeleccionado ?? ''}
          >
            <option value="" disabled>-- Seleccione --</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa} - {v.tipo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kilometraje</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={kilometraje}
            onChange={(e) => {
              const val = e.target.value;
              setKilometraje(val === '' ? '' : Number(val));
            }}
            placeholder="Ej: 45000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Cambio de aceite"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Técnico responsable</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={tecnico}
            onChange={(e) => setTecnico(e.target.value)}
            placeholder="Ej: Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Costo</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={costo}
            onChange={(e) => {
              const val = e.target.value;
              setCosto(val === '' ? '' : Number(val));
            }}
            placeholder="₡"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
            placeholder="Observaciones adicionales sobre el mantenimiento"
          ></textarea>
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
          disabled={isDisabled || registrarMantenimiento.isPending}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {registrarMantenimiento.isPending ? 'Guardando…' : 'Registrar'}
        </button>
      </div>
    </div>
  );
}
