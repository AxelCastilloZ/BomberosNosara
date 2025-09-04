import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAddEquipoBomberil, useUpdateEquipoBomberil, useCatalogos } from '../../../../hooks/useEquiposBomberiles';
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

export default function AddEquipo({ equipo, onSuccess }: Props) {
  const { data: catalogos = [] } = useCatalogos();
  const add = useAddEquipoBomberil();
  const update = useUpdateEquipoBomberil();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>();

  useEffect(() => {
    if (equipo) {
      setValue('catalogoId', equipo.catalogo?.id ?? '');
      setValue('fechaAdquisicion', equipo.fechaAdquisicion);
      setValue('estadoInicial', equipo.estadoInicial as any);
      setValue('estadoActual', equipo.estadoActual as any);
      setValue('numeroSerie', equipo.numeroSerie ?? '');
      setValue('fotoUrl', equipo.fotoUrl ?? '');
      setValue('cantidad', equipo.cantidad ?? 1);
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
    }
  }, [equipo, reset, setValue]);

  const onSubmit = (data: FormValues) => {
    const payload = { ...data, fotoUrl: data.fotoUrl?.trim() || undefined, numeroSerie: data.numeroSerie?.trim() || undefined };

    if (equipo?.id) {
      update.mutate({ id: equipo.id, ...payload }, { onSuccess });
    } else {
      add.mutate(payload as any, { onSuccess });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Tipo de equipo</label>
        <select className="input w-full"
          {...register('catalogoId', { required: 'Selecciona un tipo' })}
        >
          <option value="">-- Seleccionar --</option>
          {catalogos.map(c => (
            <option key={c.id} value={c.id}>{c.nombre} ({c.tipo})</option>
          ))}
        </select>
        {errors.catalogoId && <p className="text-red-600 text-sm">{errors.catalogoId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fecha de adquisición</label>
        <input type="date" max={todayISO} className="input w-full"
          {...register('fechaAdquisicion', { required: 'Requerido' })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Estado inicial</label>
        <select className="input w-full" {...register('estadoInicial', { required: 'Requerido' })}>
          <option value="nuevo">Nuevo</option>
          <option value="usado">Usado</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Estado actual</label>
        <select className="input w-full" {...register('estadoActual', { required: 'Requerido' })}>
          <option value="disponible">Disponible</option>
          <option value="en mantenimiento">En mantenimiento</option>
          <option value="dado de baja">Dado de baja</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Número de serie (opcional)</label>
        <input className="input w-full" {...register('numeroSerie')} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">URL de foto (opcional)</label>
        <input className="input w-full" {...register('fotoUrl', {
          validate: (v) => !v || /^https?:\/\//i.test(v) || 'Debe ser URL http/https',
        })} />
        {errors.fotoUrl && <p className="text-red-600 text-sm">{errors.fotoUrl.message as string}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Cantidad</label>
        <input type="number" className="input w-full"
          {...register('cantidad', { required: true, valueAsNumber: true, min: { value: 1, message: 'Mínimo 1' } })}
        />
        {errors.cantidad && <p className="text-red-600 text-sm">{errors.cantidad.message as string}</p>}
      </div>

      <div className="md:col-span-2 text-right">
        <button
          type="submit"
          className="px-6 py-2 rounded text-white bg-green-600 hover:bg-green-700"
        >
          {equipo ? 'Actualizar' : 'Registrar equipo'}
        </button>
      </div>
    </form>
  );
}
