import React, { useState } from 'react';
import {
  useEquiposBomberiles,
  useActualizarEstadoActual,
} from '../../../../hooks/useEquiposBomberiles';
import type { EquipoBomberil } from '../../../../interfaces/EquipoBomberil/equipoBomberil';

interface Props {
  equipo?: EquipoBomberil;
  onClose: () => void;
}

type Estado = EquipoBomberil['estadoActual'];
type AmbitoAplicacion = 'todo' | 'parcial';

export default function UpdateEstado({ equipo, onClose }: Props) {
  const { data: equipos = [] } = useEquiposBomberiles();
  const update = useActualizarEstadoActual();

  const [sel, setSel] = useState<EquipoBomberil | undefined>(equipo);
  const [estado, setEstado] = useState<Estado | ''>(equipo?.estadoActual ?? '');
  const [ambito, setAmbito] = useState<AmbitoAplicacion>('todo');
  const [cantidadAfectada, setCantidadAfectada] = useState<number>(1);

  const isPartial = ambito === 'parcial';
  const canSubmit =
    !!sel &&
    !!estado &&
    (!isPartial ||
      (cantidadAfectada >= 1 && cantidadAfectada <= (sel?.cantidad ?? 0)));

  const guardar = () => {
    if (!sel || !estado) return;

    // ID como string (el hook/servicio lo esperan así)
    const payload = {
      id: String(sel.id),
      estadoActual: estado as Estado,
      ...(isPartial ? { cantidadAfectada } : {}),
    };

    update.mutate(payload, { onSuccess: onClose });
  };

  return (
    <div className="bg-white border rounded shadow p-6">
      <h2 className="text-xl font-bold mb-2">Actualizar estado</h2>

      {!sel && (
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">
            Seleccionar equipo
          </label>
          <select
            className="border rounded px-3 py-2 w-full"
            defaultValue=""
            onChange={(e) => {
              const selectedId = e.target.value; // string
              const found = equipos.find((v) => String(v.id) === selectedId);
              setSel(found);
              setEstado((found?.estadoActual as Estado) ?? '');
              setCantidadAfectada(1);
              setAmbito('todo');
            }}
          >
            <option value="" disabled>
              -- Seleccione --
            </option>
            {equipos.map((v) => (
              <option key={String(v.id)} value={String(v.id)}>
                {v.catalogo?.nombre} — {v.cantidad}
              </option>
            ))}
          </select>
        </div>
      )}

      {sel && (
        <>
          <div className="mb-4">
            <div className="text-sm text-slate-600 mb-1">Equipo</div>
            <div className="font-medium">
              {sel.catalogo?.nombre} (x{sel.cantidad})
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">
              Nuevo estado
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['disponible', 'en mantenimiento', 'dado de baja'] as const).map(
                (e) => (
                  <button
                    key={e}
                    type="button"
                    className={`border rounded p-3 text-left ${
                      estado === e
                        ? 'border-2 border-red-600 bg-red-50'
                        : 'hover:border-slate-400'
                    }`}
                    onClick={() => setEstado(e)}
                  >
                    <div className="font-semibold capitalize">{e}</div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Ámbito de aplicación */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Aplicar a</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="ambito"
                  value="todo"
                  checked={ambito === 'todo'}
                  onChange={() => setAmbito('todo')}
                />
                <span>Todo el grupo (x{sel.cantidad})</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="ambito"
                  value="parcial"
                  checked={ambito === 'parcial'}
                  onChange={() => setAmbito('parcial')}
                />
                <span>Solo algunas unidades</span>
              </label>
            </div>

            {isPartial && (
              <div className="mt-3">
                <label className="block text-sm text-slate-700 mb-1">
                  Cantidad a afectar (máx. {sel.cantidad})
                </label>
                <input
                  type="number"
                  min={1}
                  max={sel.cantidad}
                  value={cantidadAfectada}
                  onChange={(e) => setCantidadAfectada(Number(e.target.value))}
                  className="border rounded px-3 py-2 w-40"
                />
                {cantidadAfectada > (sel.cantidad ?? 0) && (
                  <p className="text-red-600 text-sm mt-1">
                    No puede exceder la cantidad disponible.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-slate-100 rounded">
              Cancelar
            </button>
            <button
              onClick={guardar}
              disabled={!canSubmit}
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
