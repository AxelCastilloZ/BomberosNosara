// src/components/ui/Administrativa/EquipoBomberil/ScheduleMaintenanceEquipo.tsx
import React, { useMemo, useState } from 'react';
import {
  useEquiposBomberiles,
  useProgramarMantenimientoEquipo,
} from '../../../../hooks/useEquiposBomberiles';
import type { EquipoMantenimientoProgramado } from '../../../../interfaces/EquipoBomberil/equipoBomberil';

type Props = { onClose: () => void; equipoId?: string };

export default function ScheduleMaintenanceEquipo({ onClose, equipoId }: Props) {
  const { data: equipos = [] } = useEquiposBomberiles();
  const programar = useProgramarMantenimientoEquipo();

  const [id, setId] = useState<string>(equipoId ?? '');
  const [fecha, setFecha] = useState<string>('');
  const [tipo, setTipo] = useState<EquipoMantenimientoProgramado['tipo']>('preventivo');
  const [prioridad, setPrioridad] = useState<EquipoMantenimientoProgramado['prioridad']>('media');
  const [tecnico, setTecnico] = useState<string>('');                // <- antes "responsable"
  const [observaciones, setObs] = useState<string>('');

  const seleccionado = useMemo(() => equipos.find(e => e.id === id), [equipos, id]);

  const canSubmit = id && fecha && tecnico;

  const submit = () => {
    if (!canSubmit) return;
    programar.mutate(
      {
        id,
        data: {
          fechaProximoMantenimiento: fecha,
          tecnico,                                                     // <- campo correcto
          tipo,
          prioridad,
          observaciones: observaciones.trim() || undefined,
        },
      },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-1 text-gray-800">Programar mantenimiento</h2>
      <p className="text-sm text-gray-500 mb-6">
        Completa los detalles para agendar un próximo mantenimiento
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Equipo</label>
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
            {equipoId && seleccionado && (
              <p className="text-xs text-gray-500 mt-1">
                {seleccionado.catalogo?.nombre} — {seleccionado.catalogo?.tipo} ({seleccionado.cantidad})
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Técnico responsable</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={tecnico}
              onChange={(e) => setTecnico(e.target.value)}
              placeholder="Nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as EquipoMantenimientoProgramado['tipo'])}
            >
              <option value="preventivo">Preventivo</option>
              <option value="correctivo">Correctivo</option>
              <option value="inspección">Inspección</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Prioridad</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as EquipoMantenimientoProgramado['prioridad'])}
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Observaciones (opcional)</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={3}
              value={observaciones}
              onChange={(e) => setObs(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
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
          Guardar
        </button>
      </div>
    </div>
  );
}
