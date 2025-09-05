// src/components/ui/Administrativa/EquipoBomberil/RecordMaintenanceEquipo.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  useEquiposBomberiles,
  useRegistrarMantenimientoEquipo,
} from '../../../../hooks/useEquiposBomberiles';
import type { EquipoBomberil } from '../../../../interfaces/EquipoBomberil/equipoBomberil';

type Props = {
  onClose: () => void;
  /** Si viene un id, bloqueamos el selector y fijamos el grupo correspondiente a ese id */
  equipoId?: string;
};

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
  items: EquipoBomberil[];
  itemIds: string[];
};

type AplicarEn = 'todos' | 'disponible' | 'en mantenimiento';

export default function RecordMaintenanceEquipo({ onClose, equipoId }: Props) {
  const { data: equipos = [] } = useEquiposBomberiles();
  const registrar = useRegistrarMantenimientoEquipo();

  // ===================== Agrupar por (catálogo + fecha) =====================
  const { grupos, idToGroupKey } = useMemo(() => {
    const map = new Map<string, Grupo>();
    const idToKey = new Map<string, string>();

    for (const it of equipos) {
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
          total: 0,
          disp: 0,
          mantto: 0,
          baja: 0,
          items: [],
          itemIds: [],
        };
        map.set(key, g);
      }
      g.total += it.cantidad ?? 0;
      if (it.estadoActual === 'disponible') g.disp += it.cantidad ?? 0;
      if (it.estadoActual === 'en mantenimiento') g.mantto += it.cantidad ?? 0;
      if (it.estadoActual === 'dado de baja') g.baja += it.cantidad ?? 0;

      g.items.push(it);
      g.itemIds.push(String(it.id));
      idToKey.set(String(it.id), key);
    }

    const list = Array.from(map.values()).sort((a, b) => {
      const byName = a.nombre.localeCompare(b.nombre);
      if (byName !== 0) return byName;
      return b.fecha.localeCompare(a.fecha); // fecha desc
    });

    return { grupos: list, idToGroupKey: idToKey };
  }, [equipos]);

  // ===================== Estado del formulario =====================
  const [groupKey, setGroupKey] = useState<string>('');
  const [aplicarEn, setAplicarEn] = useState<AplicarEn>('todos');

  const [fecha, setFecha] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [tecnico, setTecnico] = useState<string>('');
  const [costo, setCosto] = useState<number | ''>('');
  const [observaciones, setObs] = useState<string>('');

  // Si viene equipoId, fijamos el grupo correspondiente y bloqueamos el selector
  useEffect(() => {
    if (equipoId && idToGroupKey.size > 0) {
      const k = idToGroupKey.get(String(equipoId));
      if (k) setGroupKey(k);
    }
  }, [equipoId, idToGroupKey]);

  const grupoSel = useMemo(
    () => grupos.find(g => g.key === groupKey),
    [grupos, groupKey]
  );

  // ===================== Helpers =====================
  const onChangeCosto: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const v = e.target.value;
    if (v === '' || v === '-') {
      setCosto('');
      return;
    }
    const n = Number(v);
    setCosto(Number.isFinite(n) ? n : '');
  };

  const canSubmit =
    Boolean(groupKey && fecha && descripcion && tecnico) &&
    !registrar.isPending;

  // ===================== Submit =====================
  const submit = async () => {
    if (!canSubmit || !grupoSel) return;

    const targetItems =
      aplicarEn === 'todos'
        ? grupoSel.items
        : grupoSel.items.filter((i) => i.estadoActual === aplicarEn);

    if (targetItems.length === 0) {
      return;
    }

    const costoNumber =
      costo === '' ? undefined : Number.isFinite(costo) ? (costo as number) : undefined;

    await Promise.all(
      targetItems.map((it) =>
        registrar.mutateAsync({
          id: String(it.id),
          data: {
            fecha,
            descripcion,
            tecnico,
            costo: costoNumber,
            observaciones: observaciones.trim() || undefined,
          },
        })
      )
    );

    setFecha('');
    setDescripcion('');
    setTecnico('');
    setCosto('');
    setObs('');
    onClose();
  };

  // Etiqueta compacta para el <option>
  const labelGrupo = (g: Grupo) => `${g.nombre} — ${g.fecha}`;

  return (
    <div className="bg-white border border-gray-300 shadow rounded-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">Registrar mantenimiento</h2>
      <p className="text-sm text-gray-500 mb-6">
        Selecciona un <strong>grupo</strong> (catálogo + fecha de adquisición) y registra el mantenimiento.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Grupo */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
          <select
            className="w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:text-gray-600"
            value={groupKey}
            onChange={(e) => setGroupKey(e.target.value)}
            disabled={Boolean(equipoId)}
          >
            <option value="">-- Seleccione --</option>
            {grupos.map((g) => (
              <option key={g.key} value={g.key}>
                {labelGrupo(g)}
              </option>
            ))}
          </select>

          {/* Resumen debajo, sólo como ayuda visual */}
          {grupoSel && (
            <p className="text-xs text-gray-500 mt-2">
              Total {grupoSel.total}
              {' · '}Disponible {grupoSel.disp}
              {' · '}Mantenimiento {grupoSel.mantto}
              {grupoSel.baja ? ` · Baja ${grupoSel.baja}` : ''}
            </p>
          )}
        </div>

        {/* Aplicar en */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aplicar a</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={aplicarEn}
            onChange={(e) => setAplicarEn(e.target.value as AplicarEn)}
          >
            <option value="todos">Todo el grupo</option>
            <option value="disponible">Solo “Disponible”</option>
            <option value="en mantenimiento">Solo “En mantenimiento”</option>
          </select>
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        {/* Técnico */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Técnico responsable</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={tecnico}
            onChange={(e) => setTecnico(e.target.value)}
            placeholder="Nombre del técnico"
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: cambio de empaques, limpieza…"
          />
        </div>

        {/* Costo */}
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

        {/* Observaciones */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
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
