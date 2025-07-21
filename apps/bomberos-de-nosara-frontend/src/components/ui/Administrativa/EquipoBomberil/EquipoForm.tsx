import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { EquipoBomberil } from '../../../../interfaces/EquipoBomberil/equipoBomberil';
import {
  useAddEquipoBomberil,
  useUpdateEquipoBomberil,
  useCatalogos,
  useAddCatalogoEquipo,
} from '../../../../hooks/useEquiposBomberiles';

interface FormValues extends Omit<Partial<EquipoBomberil>, 'catalogo'> {
  catalogoId: string;
  cantidad: number;
}

interface Props {
  equipo?: EquipoBomberil;
  onSuccess?: () => void;
}

export default function EquipoForm({ equipo, onSuccess }: Props) {
  const { register, handleSubmit, reset, setValue } = useForm<FormValues>();
  const { data: catalogos = [] } = useCatalogos();

  const addEquipo = useAddEquipoBomberil();
  const updateEquipo = useUpdateEquipoBomberil();
  const addCatalogo = useAddCatalogoEquipo();

  const [showCatalogoForm, setShowCatalogoForm] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState<'terrestre' | 'marítimo' | ''>('');

  useEffect(() => {
    if (equipo) {
      setValue('catalogoId', equipo.catalogo?.id ?? '');
      setValue('fechaAdquisicion', equipo.fechaAdquisicion);
      setValue('estadoInicial', equipo.estadoInicial);
      setValue('estadoActual', equipo.estadoActual);
      setValue('numeroSerie', equipo.numeroSerie ?? '');
      setValue('fotoUrl', equipo.fotoUrl ?? '');
      setValue('cantidad', equipo.cantidad ?? 1);
    }
  }, [equipo, setValue]);

  const handleCrearCatalogo = () => {
    if (!nuevoNombre || !nuevoTipo) {
      alert('Completa el nombre y tipo del nuevo catálogo');
      return;
    }

    addCatalogo.mutate(
      { nombre: nuevoNombre, tipo: nuevoTipo },
      {
        onSuccess: () => {
          setNuevoNombre('');
          setNuevoTipo('');
          setShowCatalogoForm(false);
        },
        onError: () => {
          alert('Error al crear tipo de catálogo');
        },
      }
    );
  };

  const onSubmit = (data: FormValues) => {
    if (!data.catalogoId || !data.fechaAdquisicion || !data.estadoInicial || !data.estadoActual) {
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }

    const formattedData = {
      catalogoId: data.catalogoId,
      fechaAdquisicion: data.fechaAdquisicion,
      estadoInicial: data.estadoInicial,
      estadoActual: data.estadoActual,
      numeroSerie: data.numeroSerie ?? '',
      fotoUrl: data.fotoUrl ?? '',
      cantidad: data.cantidad ?? 1,
    };

    if (equipo?.id) {
      updateEquipo.mutate({ ...formattedData, id: equipo.id }, { onSuccess: handleSuccess });
    } else {
      addEquipo.mutate(formattedData, { onSuccess: handleSuccess });
    }
  };

  const handleSuccess = () => {
    reset();
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label>Tipo de equipo</label>
        <select {...register('catalogoId', { required: true })} className="input w-full">
          <option value="">-- Seleccionar --</option>
          {catalogos.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre} ({cat.tipo})
            </option>
          ))}
        </select>

        <button
          type="button"
          className="text-blue-600 underline mt-1"
          onClick={() => setShowCatalogoForm(true)}
        >
          + Agregar nuevo tipo
        </button>

        {showCatalogoForm && (
          <div className="mt-2 border p-3 bg-gray-50 rounded space-y-2">
            <input
              className="input w-full"
              placeholder="Nombre (ej: Casco)"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
            />
            <select
              className="input w-full"
              value={nuevoTipo}
              onChange={(e) => setNuevoTipo(e.target.value as 'terrestre' | 'marítimo')}
            >
              <option value="">-- Seleccionar tipo --</option>
              <option value="terrestre">Terrestre</option>
              <option value="marítimo">Marítimo</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCrearCatalogo}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                Guardar tipo
              </button>
              <button
                type="button"
                onClick={() => setShowCatalogoForm(false)}
                className="text-red-600 underline"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <label>Fecha de adquisición</label>
        <input
          type="date"
          {...register('fechaAdquisicion', { required: true })}
          className="input w-full"
        />
      </div>

      <div>
        <label>Estado inicial</label>
        <select {...register('estadoInicial', { required: true })} className="input w-full">
          <option value="nuevo">Nuevo</option>
          <option value="usado">Usado</option>
        </select>
      </div>

      <div>
        <label>Estado actual</label>
        <select {...register('estadoActual', { required: true })} className="input w-full">
          <option value="activo">Activo</option>
          <option value="dado de baja">Dado de baja</option>
        </select>
      </div>

      <div>
        <label>Número de serie</label>
        <input {...register('numeroSerie')} className="input w-full" />
      </div>

      <div>
        <label>URL de foto</label>
        <input {...register('fotoUrl')} className="input w-full" />
      </div>

      <div>
        <label>Cantidad</label>
        <input
          type="number"
          {...register('cantidad', {
            required: true,
            valueAsNumber: true,
            min: 1,
          })}
          className="input w-full"
        />
      </div>

      <div className="md:col-span-2 text-right">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-all"
        >
          {equipo ? 'Actualizar equipo' : 'Registrar equipo'}
        </button>
      </div>
    </form>
  );
}
