// src/components/ui/Administrativa/EquipoBomberil/RecordMaintenanceEquipo.tsx
import React, { useMemo, useState } from 'react';
import {
  useEquiposBomberiles,
  useRegistrarMantenimientoEquipo,
} from '../../../../hooks/useEquiposBomberiles';

type Props = {
  onClose: () => void;
  equipoId?: string; // si viene, el select queda bloqueado
};

export default function RecordMaintenanceEquipo({ onClose, equipoId }: Props) {
  const { data: equipos = [] } = useEquiposBomberiles();
  const registrar = useRegistrarMantenimientoEquipo();

  // Estado
  const [id, setId] = useState<string>(equipoId ?? '');
  const [fecha, setFecha] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [tecnico, setTecnico] = useState<string>(''); // <- consistente con el DTO
  const [costo, setCosto] = useState<number | ''>(''); // manejar vacío sin NaN
  const [observaciones, setObs] = useState<string>('');

  const seleccion = useMemo(() => equipos.find((e) => e.id === id), [equipos, id]);

  const onChangeCosto: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const v = e.target.value;
    if (v === '' || v === '-') {
      setCosto('');
      return;
    }
    const n = Number(v);
    setCosto(Number.isFinite(n) ? n : '');
  };

  const canSubmit = Boolean(id && fecha && descripcion && tecnico);

  const submit = () => {
    if (!canSubmit) return;

    const costoNumber =
      costo === '' ? undefined : Number.isFinite(costo) ? (costo as number) : undefined;

    registrar.mutate(
      {
        id,
        data: {
          fecha,
          descripcion,
          tecnico, // <- nombre correcto del campo en el DTO
          costo: costoNumber,
          observaciones: observaciones.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          // Limpia solo si no venía un equipo preseleccionado
          if (!equipoId) setId('');
          setFecha('');
          setDescripcion('');
          setTecnico('');
          setCosto('');
          setObs('');
          onClose();
        },
      }
    );
  };

  return (
    <div className="bg-white border border-gray-300 shadow rounded-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">Registrar mantenimiento</h2>
      <p className="text-sm text-gray-500 mb-6">
        Completa los datos para registrar un mantenimiento realizado.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Equipo</label>
          <select
            className="w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:text-gray-600"
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={Boolean(equipoId)}
          >
            <option value="">-- Seleccione --</option>
            {equipos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.catalogo?.nombre} — {e.catalogo?.tipo} ({e.cantidad})
              </option>
            ))}
          </select>

          {equipoId && seleccion && (
            <p className="text-xs text-gray-500 mt-1">
              {seleccion.catalogo?.nombre} — {seleccion.catalogo?.tipo} ({seleccion.cantidad})
            </p>
          )}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Técnico responsable</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={tecnico}
            onChange={(e) => setTecnico(e.target.value)}
            placeholder="Nombre del técnico"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: cambio de empaques, limpieza…"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Costo (opcional)</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={costo}
            onChange={onChangeCosto}
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="0.00"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones (opcional)
          </label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            value={observaciones}
            onChange={(e) => setObs(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          type="button"
        >
          Cancelar
        </button>

        <button
          onClick={submit}
          disabled={!canSubmit}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          type="button"
        >
          Registrar
        </button>
      </div>
    </div>
  );
}
