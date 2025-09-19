// src/components/ui/Administrativa/EquipoBomberil/AddEquipo.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useAddEquipoBomberil,
  useUpdateEquipoBomberil,
  useCatalogos,
  useAddCatalogoEquipo,
} from '../../../../hooks/useEquiposBomberiles';
import type { EquipoBomberil } from '../../../../interfaces/EquipoBomberil/equipoBomberil';

type FormValues = {
  catalogoId: string;
  fechaAdquisicion: string;
  estadoInicial: 'nuevo' | 'usado';
  estadoActual: 'disponible' | 'en mantenimiento' | 'dado de baja';
  numeroSerie?: string;
  fotoUrl?: string;
  cantidad: number;
};

interface Props {
  equipo?: EquipoBomberil;
  onSuccess?: () => void;
}

const todayISO = new Date().toISOString().slice(0, 10);

const normalize = (s: string) =>
  (s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

export default function AddEquipo({ equipo, onSuccess }: Props) {
  const { data: catalogos = [] } = useCatalogos();
  const addEquipo = useAddEquipoBomberil();
  const updateEquipo = useUpdateEquipoBomberil();
  const addCatalogo = useAddCatalogoEquipo();

  const [crearCatOpen, setCrearCatOpen] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState<'terrestre' | 'marítimo'>('terrestre');
  const [creating, setCreating] = useState(false);

  const SERIE_MAX = 20;
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ mode: 'onChange' });

  const serieVal = watch('numeroSerie') ?? '';

  useEffect(() => {
    if (equipo) {
      setValue('catalogoId', equipo.catalogo?.id ?? '');
      setValue('fechaAdquisicion', equipo.fechaAdquisicion);
      setValue('estadoInicial', equipo.estadoInicial as any);
      setValue('estadoActual', equipo.estadoActual as any);
      setValue('numeroSerie', equipo.numeroSerie ?? '');
      setValue('fotoUrl', equipo.fotoUrl ?? '');
      setValue('cantidad', equipo.cantidad ?? 1);
      setCrearCatOpen(false);
    } else {
      reset({
        catalogoId: '',
        fechaAdquisicion: todayISO,
        estadoInicial: 'nuevo',
        estadoActual: 'disponible',
        numeroSerie: '',
        fotoUrl: '',
        cantidad: 1,
      });
      setCrearCatOpen(false);
    }
  }, [equipo, reset, setValue]);

  const onChangeCatalogo = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === '__create__') {
      setCrearCatOpen(true);
      setValue('catalogoId', '');
      return;
    }
    setCrearCatOpen(false);
    setValue('catalogoId', v);
  };

  // Crear y seleccionar catálogo (usado por el mini-form)
  const crearOSeleccionar = async (nombre: string, tipo: 'terrestre' | 'marítimo') => {
    if (!nombre.trim()) return;
    setCreating(true);
    try {
      const existing = catalogos.find(
        (c) => normalize(c.nombre) === normalize(nombre) && c.tipo === tipo
      );
      if (existing) {
        setValue('catalogoId', existing.id);
        setCrearCatOpen(false);
        return;
      }
      const created = await addCatalogo.mutateAsync({ nombre: nombre.trim(), tipo });
      setValue('catalogoId', created.id);
      setCrearCatOpen(false);
      setNuevoNombre('');
    } finally {
      setCreating(false);
    }
  };

  const crearYSeleccionarCatalogo = async () => {
    await crearOSeleccionar(nuevoNombre, nuevoTipo);
  };

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      fotoUrl: data.fotoUrl?.trim() || undefined,
      numeroSerie: data.numeroSerie?.trim() || undefined,
    };

    if (equipo?.id) {
      updateEquipo.mutate({ id: equipo.id, ...payload }, { onSuccess });
    } else {
      addEquipo.mutate(payload as any, { onSuccess });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Tipo de equipo (catálogo) */}
      <div>
        <label className="block text-sm font-medium mb-1">Tipo de equipo</label>
        <select
          className="input w-full"
          {...register('catalogoId', { required: 'Selecciona un tipo' })}
          onChange={onChangeCatalogo}
          disabled={creating}
        >
          <option value="">-- Seleccionar --</option>
          {catalogos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} ({c.tipo})
            </option>
          ))}
          <option value="__create__">+ Agregar catálogo…</option>
        </select>
        {errors.catalogoId && (
          <p className="text-red-600 text-sm">{errors.catalogoId.message}</p>
        )}

        {/* Mini-form para crear un catálogo manualmente */}
        {crearCatOpen && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1">Nombre del catálogo</label>
              <input
                className="input w-full"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Ej: casco, manguera, SCBA…"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Tipo</label>
              <select
                className="input w-full"
                value={nuevoTipo}
                onChange={(e) => setNuevoTipo(e.target.value as any)}
              >
                <option value="terrestre">Terrestre</option>
                <option value="marítimo">Marítimo</option>
              </select>
            </div>
            <div className="md:col-span-3 text-right">
              <button
                type="button"
                className="px-3 py-1.5 rounded text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                disabled={!nuevoNombre.trim() || creating}
                onClick={crearYSeleccionarCatalogo}
              >
                {creating ? 'Creando…' : 'Crear y seleccionar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fecha */}
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="fechaAdquisicion">
          Fecha de adquisición
        </label>
        <input
          id="fechaAdquisicion"
          type="date"
          max={todayISO}
          className={`input w-full ${errors.fechaAdquisicion ? 'ring-1 ring-red-500' : ''}`}
          aria-invalid={!!errors.fechaAdquisicion}
          {...register('fechaAdquisicion', { required: 'La fecha de adquisición es requerida' })}
        />
        {errors.fechaAdquisicion && (
          <p className="text-red-600 text-sm">{errors.fechaAdquisicion.message as string}</p>
        )}
      </div>

      {/* Estado inicial */}
      <div>
        <label className="block text-sm font-medium mb-1">Estado inicial</label>
        <select className="input w-full" {...register('estadoInicial', { required: 'Requerido' })}>
          <option value="nuevo">Nuevo</option>
          <option value="usado">Usado</option>
        </select>
      </div>

      {/* Estado actual */}
      <div>
        <label className="block text-sm font-medium mb-1">Estado actual</label>
        <select className="input w-full" {...register('estadoActual', { required: 'Requerido' })}>
          <option value="disponible">Disponible</option>
          <option value="en mantenimiento">En mantenimiento</option>
          <option value="dado de baja">Dado de baja</option>
        </select>
      </div>

      {/* Serie */}
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="numeroSerie">
          Número de serie (opcional)
        </label>

        <input
          id="numeroSerie"
          className={`input w-full ${errors.numeroSerie ? 'ring-1 ring-red-500' : ''}`}
          placeholder="Ej: Mr-45"
          maxLength={SERIE_MAX}
          {...register('numeroSerie', {
            maxLength: { value: SERIE_MAX, message: `Máximo ${SERIE_MAX} caracteres` },
          })}
        />

        <div className="mt-1 flex items-center justify-between">
          {(errors.numeroSerie || serieVal.length >= SERIE_MAX) ? (
            <p className="text-red-600 text-sm">Máximo {SERIE_MAX} caracteres</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-slate-400">
            {serieVal.length}/{SERIE_MAX}
          </span>
        </div>
      </div>

      {/* Foto */}
      <div>
        <label className="block text-sm font-medium mb-1">URL de foto (opcional)</label>
        <input
          className="input w-full"
          {...register('fotoUrl', {
            validate: (v) => !v || /^https?:\/\//i.test(v) || 'Debe ser URL http/https',
          })}
        />
        {errors.fotoUrl && (
          <p className="text-red-600 text-sm">{errors.fotoUrl.message as string}</p>
        )}
      </div>

      {/* Cantidad */}
      <div>
        <label className="block text-sm font-medium mb-1">Cantidad</label>
        <input
          type="number"
          className="input w-full"
          {...register('cantidad', {
            required: true,
            valueAsNumber: true,
            min: { value: 1, message: 'Mínimo 1' },
          })}
        />
        {errors.cantidad && (
          <p className="text-red-600 text-sm">{errors.cantidad.message as string}</p>
        )}
      </div>

      <div className="md:col-span-2 text-right">
        <button
          type="submit"
          className="px-6 py-2 rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          disabled={creating || addEquipo.isPending || updateEquipo.isPending}
        >
          {equipo ? 'Actualizar' : 'Registrar equipo'}
        </button>
      </div>
    </form>
  );
}
