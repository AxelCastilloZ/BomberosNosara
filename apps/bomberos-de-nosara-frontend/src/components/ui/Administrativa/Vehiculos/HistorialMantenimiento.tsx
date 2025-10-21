import React, { useMemo, useState } from 'react';
import { useVehiculos, useHistorialVehiculo } from '../../../../hooks/useVehiculos';
import { Clock, Wrench, FileText, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
}

// Si tu backend devuelve otro shape, ajusta este tipo
type ItemHistorial = {
  id: string;
  fecha: string;             // ISO date
  descripcion: string;
  kilometraje: number;
  tecnico: string;
  costo: number;
  observaciones?: string;
};

function formatMoney(n: number) {
  try { return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(n); }
  catch { return `${n}`; }
}
function shortDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

export default function HistorialMantenimientos({ onClose }: Props) {
  const { data: vehicles = [], isLoading: loadingVehiculos } = useVehiculos();

  const [vehiculoId, setVehiculoId] = useState<string>('');
  const { data: historial = [], isFetching, isError } = useHistorialVehiculo(vehiculoId);

  const seleccionado = useMemo(() => vehicles.find(v => v.id === vehiculoId), [vehicles, vehiculoId]);

  const historialOrdenado: ItemHistorial[] = useMemo(() => {
    return [...(historial as ItemHistorial[])].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }, [historial]);

  const total = useMemo(() => historialOrdenado.reduce((acc, it) => acc + (Number(it.costo) || 0), 0), [historialOrdenado]);

  return (
    <div className="max-w-6xl mx-auto bg-white border border-gray-200 shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Historial de Mantenimientos</h2>
      <p className="text-sm text-gray-600 mb-6">
        Consulta los mantenimientos realizados por vehículo.
      </p>

      {/* Selector de vehículo */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
          <select
            disabled={loadingVehiculos}
            className="w-full border rounded px-3 py-2"
            value={vehiculoId}
            onChange={(e) => setVehiculoId(e.target.value)}
          >
            <option value="">-- Seleccione un vehículo --</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.placa} — {v.tipo}
              </option>
            ))}
          </select>
        </div>

        {/* Resumen rápido */}
        <div className="border rounded p-3 bg-slate-50">
          <div className="text-xs text-slate-500">Resumen</div>
          <div className="text-sm flex items-center justify-between mt-1">
            <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> Registros</span>
            <span className="font-semibold">{historialOrdenado.length}</span>
          </div>
          <div className="text-sm flex items-center justify-between mt-1">
            <span className="flex items-center gap-1"><Wrench className="w-4 h-4" /> Costo acumulado</span>
            <span className="font-semibold">{formatMoney(total)}</span>
          </div>
          {seleccionado && (
            <div className="text-xs text-slate-500 mt-1">
              {seleccionado.placa} • {seleccionado.tipo}
            </div>
          )}
        </div>
      </div>

      {/* Estados */}
      {!vehiculoId && (
        <div className="border rounded bg-slate-50 p-4 text-slate-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Selecciona un vehículo para ver su historial.
        </div>
      )}

      {vehiculoId && isFetching && (
        <div className="border rounded bg-slate-50 p-4 text-slate-600 flex items-center gap-2">
          <Clock className="w-5 h-5 animate-pulse" />
          Cargando historial…
        </div>
      )}

      {vehiculoId && isError && (
        <div className="border rounded bg-red-50 p-4 text-red-700">
          Ocurrió un error al cargar el historial. Intenta nuevamente.
        </div>
      )}

      {/* Tabla */}
      {vehiculoId && !isFetching && !isError && (
        historialOrdenado.length > 0 ? (
          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="text-left px-4 py-2">Fecha</th>
                  <th className="text-left px-4 py-2">Descripción</th>
                  <th className="text-left px-4 py-2">Técnico</th>
                  <th className="text-right px-4 py-2">Kilometraje</th>
                  <th className="text-right px-4 py-2">Costo</th>
                  <th className="text-left px-4 py-2">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {historialOrdenado.map(item => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">{shortDate(item.fecha)}</td>
                    <td className="px-4 py-2">{item.descripcion}</td>
                    <td className="px-4 py-2">{item.tecnico}</td>
                    <td className="px-4 py-2 text-right">{Number(item.kilometraje || 0).toLocaleString()} km</td>
                    <td className="px-4 py-2 text-right">{formatMoney(Number(item.costo || 0))}</td>
                    <td className="px-4 py-2">{item.observaciones || '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td className="px-4 py-2 font-semibold" colSpan={4}>Total</td>
                  <td className="px-4 py-2 text-right font-semibold">{formatMoney(total)}</td>
                  <td className="px-4 py-2" />
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="border rounded bg-slate-50 p-4 text-slate-600">
            No hay registros de mantenimiento para este vehículo.
          </div>
        )
      )}

      <div className="flex justify-end mt-6">
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
          Volver
        </button>
      </div>
    </div>
  );
}
