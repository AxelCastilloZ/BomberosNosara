import React, { useMemo, useState } from 'react';
import { useEquiposBomberiles, useHistorialEquipo } from '../../../../hooks/useEquiposBomberiles';

type Props = {
  onClose: () => void;
  /** Si viene, el selector queda bloqueado y se carga de una vez ese historial */
  equipoId?: string;
};

export default function HistorialMantenimientoEquipo({ onClose, equipoId }: Props) {
  const { data: equipos = [], isLoading: loadingEquipos } = useEquiposBomberiles();

  const [id, setId] = useState<string>(equipoId ?? '');
  const { data: historial = [], isLoading, isError, error } = useHistorialEquipo(id || undefined);

  const equipoSel = useMemo(() => equipos.find((e) => e.id === id), [equipos, id]);

  const renderContenido = () => {
    if (!id) {
      return (
        <div className="p-4 text-sm text-slate-600 bg-slate-50 border rounded">
          Selecciona un equipo para ver su historial.
        </div>
      );
    }
    if (isLoading) return <div className="text-slate-500">Cargando historial…</div>;
    if (isError) {
      const msg = (error as any)?.message || 'No se pudo cargar el historial';
      return <div className="text-red-700">Error: {msg}</div>;
    }
    if (!historial.length) {
      return (
        <div className="p-4 text-sm text-slate-600 bg-slate-50 border rounded">
          Este equipo aún no tiene mantenimientos registrados.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Técnico</th>
              <th className="px-4 py-2 text-left">Descripción</th>
              <th className="px-4 py-2 text-right">Costo</th>
              <th className="px-4 py-2 text-left">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((m) => {
              // Backend puede devolver DECIMAL como string: mostramos amigable siempre
              const costoNum =
                (m as any).costo != null && (m as any).costo !== ''
                  ? Number((m as any).costo)
                  : undefined;
              const costoFmt =
                costoNum != null && Number.isFinite(costoNum)
                  ? costoNum.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })
                  : '—';

              return (
                <tr key={(m as any).id} className="border-t">
                  <td className="px-4 py-2">{m.fecha}</td>
                  <td className="px-4 py-2">{m.tecnico}</td>
                  <td className="px-4 py-2">{m.descripcion}</td>
                  <td className="px-4 py-2 text-right">{costoFmt}</td>
                  <td className="px-4 py-2">{m.observaciones ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto bg-white border border-gray-200 shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Historial de mantenimientos</h2>
      <p className="text-sm text-gray-600 mb-6">
        Selecciona un equipo para ver los registros de mantenimiento realizados.
      </p>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Equipo</label>
          <select
            className="w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:text-gray-600"
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={Boolean(equipoId) || loadingEquipos}
          >
            <option value="">-- Seleccione --</option>
            {equipos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.catalogo?.nombre} — {e.catalogo?.tipo} ({e.cantidad})
              </option>
            ))}
          </select>
          {equipoId && equipoSel && (
            <p className="text-xs text-gray-500 mt-1">
              {equipoSel.catalogo?.nombre} — {equipoSel.catalogo?.tipo} ({equipoSel.cantidad})
            </p>
          )}
        </div>
      </div>

      {renderContenido()}

      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          type="button"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
