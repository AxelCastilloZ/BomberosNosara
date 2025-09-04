// src/components/ui/Administrativa/EquipoBomberil/EquipoList.tsx
import React, { useMemo, useState } from 'react';
import {
  useEquiposBomberiles,
  useActualizarEstadoActual,
  useDarDeBaja,
} from '../../../../hooks/useEquiposBomberiles';
import type { EquipoBomberil } from '../../../../interfaces/EquipoBomberil/equipoBomberil';
import ModalDarDeBaja from './Modals/ModalDarDeBaja';

interface Props {
  onEstado: (e: EquipoBomberil) => void;
  onEdit?: (e: EquipoBomberil) => void;
}

export default function EquipoList({ onEstado, onEdit }: Props) {
  const { data: equipos = [], isLoading } = useEquiposBomberiles();
  const actualizarEstado = useActualizarEstadoActual();
  const darDeBaja = useDarDeBaja();

  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState<'all' | 'terrestre' | 'marítimo'>('all');
  const [confirm, setConfirm] = useState<EquipoBomberil | null>(null);

  const filtrados = useMemo(() => {
    return equipos.filter((e) => {
      const byQ = (e.catalogo?.nombre ?? '').toLowerCase().includes(q.toLowerCase());
      const byTipo = tipo === 'all' || e.catalogo?.tipo === tipo;
      return byQ && byTipo;
    });
  }, [equipos, q, tipo]);

  if (isLoading) return <div>Cargando…</div>;

  // Agrupar por catálogo para filas “plegables”
  const grupos = filtrados.reduce((acc, it) => {
    const key = it.catalogo?.id ?? 'sin';
    if (!acc[key]) {
      acc[key] = {
        nombre: it.catalogo?.nombre ?? 'Sin catálogo',
        tipo: it.catalogo?.tipo ?? '-',
        items: [] as EquipoBomberil[],
      };
    }
    acc[key].items.push(it);
    return acc;
  }, {} as Record<string, { nombre: string; tipo: string; items: EquipoBomberil[] }>);

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
          onChange={(e) => setTipo(e.target.value as any)}
          className="border rounded px-3 py-2"
        >
          <option value="all">Todos los tipos</option>
          <option value="terrestre">Terrestre</option>
          <option value="marítimo">Marítimo</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-left">Fecha adquisición</th>
              <th className="px-4 py-2 text-left">Estado inicial</th>
              <th className="px-4 py-2 text-left">Estado actual</th>
              <th className="px-4 py-2 text-right">Cantidad</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grupos).map(([key, g]) => {
              const totalDisp = g.items
                .filter((i) => i.estadoActual === 'disponible')
                .reduce((s, i) => s + i.cantidad, 0);
              const totalMant = g.items
                .filter((i) => i.estadoActual === 'en mantenimiento')
                .reduce((s, i) => s + i.cantidad, 0);
              const totalBaja = g.items
                .filter((i) => i.estadoActual === 'dado de baja')
                .reduce((s, i) => s + i.cantidad, 0);

              return (
                <React.Fragment key={key}>
                  <tr className="bg-slate-50">
                    <td colSpan={6} className="px-4 py-2 font-semibold">
                      {g.nombre} ({g.tipo}) — Disponibles: {totalDisp} — Mantto: {totalMant} — Baja: {totalBaja}
                    </td>
                  </tr>

                  {g.items.map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="px-4 py-2">{e.catalogo?.nombre}</td>
                      <td className="px-4 py-2">{e.fechaAdquisicion}</td>
                      <td className="px-4 py-2">{e.estadoInicial}</td>
                      <td className="px-4 py-2">
                        <select
                          value={e.estadoActual}
                          onChange={(ev) =>
                            actualizarEstado.mutate({
                              id: e.id,
                              estadoActual: ev.target.value as any,
                            })
                          }
                          className="border rounded px-2 py-1"
                        >
                          <option value="disponible">Disponible</option>
                          <option value="en mantenimiento">En mantenimiento</option>
                          <option value="dado de baja">Dado de baja</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 text-right">{e.cantidad}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-3 flex-wrap">
                          <button
                            className="text-slate-700 hover:underline"
                            onClick={() => onEstado(e)}
                          >
                            Estado
                          </button>
                          <button
                            className="text-indigo-600 hover:underline"
                            onClick={() => onEdit?.(e)}
                          >
                            Editar
                          </button>
                          <button
                            className="text-red-600 hover:underline"
                            onClick={() => setConfirm(e)}
                          >
                            Dar de baja
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {confirm && (
        <ModalDarDeBaja
          equipo={confirm}
          onClose={() => setConfirm(null)}
          onConfirm={(cantidad) => {
            darDeBaja.mutate(
              { id: confirm.id, cantidad },
              { onSuccess: () => setConfirm(null) }
            );
          }}
        />
      )}
    </div>
  );
}
