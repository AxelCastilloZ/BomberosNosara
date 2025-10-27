// src/components/ui/Administrativa/EquipoBomberil/EquipoList.tsx
import React, { useMemo, useState } from 'react';
import {
  useEquiposBomberiles,
  useActualizarEstadoActual,
  useDarDeBaja,
} from '../../../../hooks/useEquiposBomberiles';
import type { EquipoBomberil } from '../../../../interfaces/EquipoBomberil/equipoBomberil';

type Estado = EquipoBomberil['estadoActual'];
type Tipo = 'all' | 'terrestre' | 'marítimo';

interface Props {
  onEstado: (e: EquipoBomberil) => void;
  onEdit?: (e: EquipoBomberil) => void;
}

type Grupo = {
  key: string; // catalogoId|fecha
  catalogoId: string;
  nombre: string;
  tipo: string;
  fecha: string;
  total: number;
  disp: number;
  mantto: number;
  baja: number;
  // para operar
  items: EquipoBomberil[];
};

export default function EquipoList({ onEstado, onEdit }: Props) {
  const { data: equipos = [], isLoading } = useEquiposBomberiles();
  const actualizarEstado = useActualizarEstadoActual();
  const darDeBaja = useDarDeBaja();

  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState<Tipo>('all');

  // Modal "Mover parcial"
  const [mover, setMover] = useState<{
    grupo: Grupo | null;
    desde: Exclude<Estado, 'dado de baja'>;
    hacia: Exclude<Estado, 'dado de baja'>;
    cantidad: number;
  }>({ grupo: null, desde: 'disponible', hacia: 'en mantenimiento', cantidad: 1 });

  const filtrados = useMemo(() => {
    const qlc = q.toLowerCase();
    return equipos.filter((e) => {
      const nombre = (e.catalogo?.nombre ?? '').toLowerCase();
      const byQ = nombre.includes(qlc);
      const byTipo = tipo === 'all' || e.catalogo?.tipo === tipo;
      return byQ && byTipo;
    });
  }, [equipos, q, tipo]);

  // 🔹 Unificar filas por (catalogoId + fechaAdquisicion)
  const grupos = useMemo(() => {
    const map = new Map<string, Grupo>();
    for (const it of filtrados) {
      const catId = it.catalogo?.id ?? 'sin';
      const key = `${catId}|${it.fechaAdquisicion}`;
      let g = map.get(key);
      if (!g) {
        g = {
          key,
          catalogoId: catId,
          nombre: it.catalogo?.nombre ?? 'Sin catálogo',
          tipo: it.catalogo?.tipo ?? '-',
          fecha: it.fechaAdquisicion,
          total: 0, disp: 0, mantto: 0, baja: 0,
          items: [],
        };
        map.set(key, g);
      }
      g.total += it.cantidad ?? 0;
      if (it.estadoActual === 'disponible') g.disp += it.cantidad ?? 0;
      if (it.estadoActual === 'en mantenimiento') g.mantto += it.cantidad ?? 0;
      if (it.estadoActual === 'dado de baja') g.baja += it.cantidad ?? 0;
      g.items.push(it);
    }
    // ordenar por nombre + fecha desc
    return Array.from(map.values()).sort((a, b) => {
      const n = a.nombre.localeCompare(b.nombre);
      if (n !== 0) return n;
      return b.fecha.localeCompare(a.fecha);
    });
  }, [filtrados]);

  if (isLoading) return <div>Cargando…</div>;

  // 🔹 Cambiar TODO el grupo a un estado (servicio / malo / fuera de servicio)
  const changeAllGroupTo = async (g: Grupo, estado: Estado) => {
    // Cambiamos cada fila del grupo; el backend consolida.
    for (const it of g.items) {
      if (it.estadoActual !== estado) {
        await actualizarEstado.mutateAsync({ id: String(it.id), estadoActual: estado });
      }
    }
  };

  // 🔹 Mover PARCIAL una cantidad desde un estado a otro dentro del grupo
  const movePartial = async (g: Grupo, desde: Exclude<Estado, 'dado de baja'>, hacia: Exclude<Estado, 'dado de baja'>, qty: number) => {
    if (desde === hacia || qty <= 0) return;
    // Selecciona las filas origen que tengan stock en "desde" y reparte 'qty'
    let restante = qty;
    const candidatos = g.items
      .filter(i => i.estadoActual === desde && i.cantidad > 0)
      // opcional: prioriza los más grandes para menos parches
      .sort((a, b) => b.cantidad - a.cantidad);

    for (const it of candidatos) {
      if (restante <= 0) break;
      const tomar = Math.min(it.cantidad, restante);
      await actualizarEstado.mutateAsync({
        id: String(it.id),
        estadoActual: hacia,
        cantidadAfectada: tomar,
      });
      restante -= tomar;
    }
  };

  return (
    <div className="bg-white border rounded shadow">
      {/* Filtros */}
      <div className="p-4 flex flex-col md:flex-row gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por catálogo (ej: manguera, pala...)"
          className="border rounded px-3 py-2 flex-1"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as Tipo)}
          className="border rounded px-3 py-2"
        >
          <option value="all">Todos los tipos</option>
          <option value="terrestre">Terrestre</option>
          <option value="marítimo">Marítimo</option>
        </select>
      </div>

      {/* Tabla (una fila por grupo fecha+catálogo) */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-left">Fecha adquisición</th>
              <th className="px-4 py-2 text-left">Distribución</th>
              <th className="px-4 py-2 text-left">Cambiar todos a…</th>
              <th className="px-4 py-2 text-right">Total registrado</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((g) => (
              <tr key={g.key} className="border-t">
                <td className="px-4 py-2">
                  <div className="font-medium">{g.nombre}</div>
                  <div className="text-xs text-slate-500">{g.tipo}</div>
                </td>
                <td className="px-4 py-2">{g.fecha}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-3 text-xs">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> En servicio: {g.disp}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" /> Malo: {g.mantto}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <select
                    className="border rounded px-2 py-1"
                    defaultValue=""
                    onChange={async (ev) => {
                      const v = ev.target.value as '' | 'disponible' | 'en mantenimiento' | 'dado de baja';
                      if (!v) return;
                      await changeAllGroupTo(g, v);
                      ev.currentTarget.value = ''; // reset placeholder
                    }}
                  >
                    <option value="" disabled>Selecciona…</option>
                    <option value="disponible">En servicio</option>
                    <option value="en mantenimiento">Malo</option>
                    <option value="dado de baja">Fuera de servicio</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-right font-semibold">{g.total}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-3 flex-wrap">
                    <button
                      className="text-slate-700 hover:underline"
                      onClick={() => {
                        // abre modal mover parcial desde/hacia
                        setMover({ grupo: g, desde: 'disponible', hacia: 'en mantenimiento', cantidad: 1 });
                      }}
                    >
                      Mover parcial
                    </button>
                    {/* Opcionalmente, dejar Editar/Dar de baja usando el primer item del grupo */}
                    <button
                      className="text-indigo-600 hover:underline"
                      onClick={() => onEdit?.(g.items[0])}
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => {
                        const it = g.items[0];
                        // darDeBaja.mutate({ id: String(it.id), cantidad: it.cantidad });
                        onEstado(it); // reutiliza tu modal existente si ya lo tienes
                      }}
                    >
                      Dar de baja
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {grupos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No hay equipos para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal mover parcial simple */}
      {mover.grupo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow p-4 w-full max-w-md">
            <div className="text-lg font-semibold mb-2">Mover parcial</div>
            <div className="space-y-3">
              <div className="text-sm text-slate-600">
                {mover.grupo.nombre} — {mover.grupo.tipo} — {mover.grupo.fecha}
              </div>
              <div className="grid grid-cols-3 gap-2 items-end">
                <div>
                  <label className="text-xs block mb-1">Desde</label>
                  <select
                    className="border rounded px-2 py-1 w-full"
                    value={mover.desde}
                    onChange={(e) =>
                      setMover((m) => ({ ...m, desde: e.target.value as any }))
                    }
                  >
                    <option value="disponible">En servicio ({mover.grupo.disp})</option>
                    <option value="en mantenimiento">Malo ({mover.grupo.mantto})</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs block mb-1">Hacia</label>
                  <select
                    className="border rounded px-2 py-1 w-full"
                    value={mover.hacia}
                    onChange={(e) =>
                      setMover((m) => ({ ...m, hacia: e.target.value as any }))
                    }
                  >
                    <option value="disponible">En servicio</option>
                    <option value="en mantenimiento">Malo</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs block mb-1">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    className="border rounded px-2 py-1 w-full"
                    value={mover.cantidad}
                    onChange={(e) =>
                      setMover((m) => ({ ...m, cantidad: Number(e.target.value) || 1 }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-3 py-1.5 rounded border"
                  onClick={() => setMover({ grupo: null, desde: 'disponible', hacia: 'en mantenimiento', cantidad: 1 })}
                >
                  Cancelar
                </button>
                <button
                  className="px-3 py-1.5 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  disabled={
                    mover.desde === mover.hacia ||
                    mover.cantidad < 1 ||
                    (mover.desde === 'disponible' && mover.cantidad > (mover.grupo?.disp ?? 0)) ||
                    (mover.desde === 'en mantenimiento' && mover.cantidad > (mover.grupo?.mantto ?? 0))
                  }
                  onClick={async () => {
                    if (!mover.grupo) return;
                    await movePartial(mover.grupo, mover.desde, mover.hacia, mover.cantidad);
                    setMover({ grupo: null, desde: 'disponible', hacia: 'en mantenimiento', cantidad: 1 });
                  }}
                >
                  Mover
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
