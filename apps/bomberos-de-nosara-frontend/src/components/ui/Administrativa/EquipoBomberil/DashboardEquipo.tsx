// src/components/ui/Administrativa/EquipoBomberil/DashboardEquipo.tsx
import React, { useMemo, useState } from 'react';
import { useEquiposBomberiles } from '../../../../hooks/useEquiposBomberiles';
import EquipoList from './EquipoList';
import AddEquipo from './AddEquipo';
import UpdateEstado from './UpdateEstado';
import MantenimientoEquipo from './MantenimientoEquipo';
import type { EquipoBomberil } from '../../../../interfaces/EquipoBomberil/equipoBomberil';

type Vista = 'home' | 'lista' | 'agregar' | 'estado' | 'mantenimiento';

export default function DashboardEquipo() {
  const [vista, setVista] = useState<Vista>('home');
  const [seleccionado, setSeleccionado] = useState<EquipoBomberil | null>(null);
  const { data: equipos = [], isLoading } = useEquiposBomberiles();

  const go = (v: Vista, eq?: EquipoBomberil) => {
    setSeleccionado(eq ?? null);
    setVista(v);
  };
  const back = () => go('home');

  const porCatalogo = useMemo(() => {
    const map = new Map<
      string,
      { id: string; nombre: string; tipo: string; total: number; disp: number; mantto: number; baja: number }
    >();

    for (const e of equipos) {
      const id = e.catalogo?.id ?? 'sin';
      const row =
        map.get(id) ??
        { id, nombre: e.catalogo?.nombre ?? 'Sin catálogo', tipo: e.catalogo?.tipo ?? '-', total: 0, disp: 0, mantto: 0, baja: 0 };

      row.total += e.cantidad ?? 0;
      if (e.estadoActual === 'disponible') row.disp += e.cantidad ?? 0;
      if (e.estadoActual === 'en mantenimiento') row.mantto += e.cantidad ?? 0;
      if (e.estadoActual === 'dado de baja') row.baja += e.cantidad ?? 0;

      map.set(id, row);
    }

    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [equipos]);

  if (vista !== 'home') {
    return (
      <div>
        <button onClick={back} className="mb-4 text-sm text-blue-600 hover:underline">← Volver</button>

        {vista === 'lista' && (
          <EquipoList
            onEdit={(e) => { setSeleccionado(e); setVista('agregar'); }}
            onEstado={(e) => go('estado', e)}
          />
        )}

        {vista === 'agregar' && (
          <div className="max-w-4xl mx-auto bg-white border rounded shadow p-6">
            <AddEquipo equipo={seleccionado ?? undefined} onSuccess={back} />
          </div>
        )}

        {vista === 'estado' && <div className="max-w-3xl mx-auto"><UpdateEstado onClose={back} /></div>}
        {vista === 'mantenimiento' && <MantenimientoEquipo onBack={back} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Acciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <NavCard title="Lista de equipos" subtitle="Ver y filtrar todos los equipos" onClick={() => go('lista')} />
        <NavCard title="Agregar equipo" subtitle="Registrar nuevo equipo" onClick={() => go('agregar')} highlight />
        <NavCard title="Actualizar estado" subtitle="Cambiar estado de un equipo" onClick={() => go('estado')} />
        <NavCard title="Mantenimiento" subtitle="Registrar / Programar / Historial" onClick={() => go('mantenimiento')} />
      </div>

      {/* Disponibilidad por catálogo */}
      <div className="space-y-3">
        <div className="text-lg font-semibold">Disponibilidad por catálogo</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading && <div className="text-slate-500">Cargando…</div>}
          {!isLoading && porCatalogo.map((c) => (
            <div key={c.id} className="rounded border bg-white p-4">
              <div className="text-xs text-slate-500 mb-1">{c.tipo}</div>
              <div className="flex items-baseline justify-between">
                <div className="text-base font-semibold">{c.nombre}</div>
                <div className="text-3xl font-extrabold text-emerald-600">{c.disp}</div>
              </div>
              <div className="text-xs text-slate-500">Disponibles</div>
              <div className="mt-3 text-sm space-y-1">
                <Row label="Total" value={c.total} />
                <Row label="Mantenimiento" value={c.mantto} className="text-amber-700" />
                <Row label="Baja" value={c.baja} className="text-red-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NavCard({ title, subtitle, onClick, highlight }:{
  title:string; subtitle:string; onClick:()=>void; highlight?:boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded border p-6 text-left hover:shadow transition bg-white ${highlight ? 'border-red-300' : 'border-slate-200'}`}
    >
      <div className={`text-lg font-semibold ${highlight ? 'text-red-700' : ''}`}>{title}</div>
      <div className="text-slate-600 text-sm">{subtitle}</div>
    </button>
  );
}

function Row({ label, value, className = '' }:{label:string; value:React.ReactNode; className?:string}) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-600">{label}</span>
      <span className={`font-medium ${className}`}>{value}</span>
    </div>
  );
}
