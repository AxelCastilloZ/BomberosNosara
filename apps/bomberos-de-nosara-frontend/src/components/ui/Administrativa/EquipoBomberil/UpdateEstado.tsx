import React, { useState } from 'react';
import { useEquiposBomberiles, useActualizarEstadoActual } from '../../../../hooks/useEquiposBomberiles';
import type { EquipoBomberil } from '../../../../interfaces/EquipoBomberil/equipoBomberil';

interface Props {
  equipo?: EquipoBomberil;
  onClose: () => void;
}

export default function UpdateEstado({ equipo, onClose }: Props) {
  const { data: equipos = [] } = useEquiposBomberiles();
  const update = useActualizarEstadoActual();

  const [sel, setSel] = useState<EquipoBomberil | undefined>(equipo);
  const [estado, setEstado] = useState<EquipoBomberil['estadoActual'] | ''>(equipo?.estadoActual ?? '');

  const guardar = () => {
    if (!sel || !estado) return;
    update.mutate({ id: sel.id, estadoActual: estado }, { onSuccess: onClose });
  };

  return (
    <div className="bg-white border rounded shadow p-6">
      <h2 className="text-xl font-bold mb-2">Actualizar estado</h2>
      {!sel && (
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Seleccionar equipo</label>
          <select
            className="border rounded px-3 py-2 w-full"
            defaultValue=""
            onChange={(e) => {
              const found = equipos.find(v => v.id === e.target.value);
              setSel(found);
              setEstado(found?.estadoActual ?? '');
            }}
          >
            <option value="" disabled>-- Seleccione --</option>
            {equipos.map(v => (
              <option key={v.id} value={v.id}>{v.catalogo?.nombre} — {v.cantidad}</option>
            ))}
          </select>
        </div>
      )}

      {sel && (
        <>
          <div className="mb-4">
            <div className="text-sm text-slate-600 mb-1">Equipo</div>
            <div className="font-medium">{sel.catalogo?.nombre} (x{sel.cantidad})</div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-1">Nuevo estado</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['disponible','en mantenimiento','dado de baja'] as const).map(e => (
                <button
                  key={e}
                  type="button"
                  className={`border rounded p-3 text-left ${estado===e ? 'border-2 border-red-600 bg-red-50' : 'hover:border-slate-400'}`}
                  onClick={() => setEstado(e)}
                >
                  <div className="font-semibold capitalize">{e}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-slate-100 rounded">
              Cancelar
            </button>
            <button
              onClick={guardar}
              disabled={!estado}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Actualizar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
