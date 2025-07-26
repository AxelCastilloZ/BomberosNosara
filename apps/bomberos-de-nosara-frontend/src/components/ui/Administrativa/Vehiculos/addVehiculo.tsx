import React from 'react';
import { useForm } from 'react-hook-form';
import { useAddVehiculo } from '../../../../hooks/useVehiculos';
import type { Vehicle, TipoVehiculo, EstadoVehiculo } from '../../../../interfaces/Vehiculos/vehicle';

interface AddVehicleProps {
  onSuccess?: () => void;
}

type FormValues = Omit<Vehicle, 'id'>;

const tipos: TipoVehiculo[] = ['camión', 'ambulancia', 'pickup', 'moto', 'vehículo utilitario', 'otro'];
const estados: EstadoVehiculo[] = ['activo', 'en mantenimiento', 'en reparación', 'dado de baja'];

export default function AddVehiculo({ onSuccess }: AddVehicleProps) {
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const addVehiculo = useAddVehiculo();

  const onSubmit = (data: FormValues) => {
    if (!data.tipo || !data.placa || !data.estadoActual || !data.estadoInicial || !data.fechaAdquisicion) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    addVehiculo.mutate(data, {
      onSuccess: () => {
        alert('Vehículo registrado correctamente');
        reset();
        onSuccess?.();
      },
      onError: () => {
        alert('Error al registrar vehículo');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label>Tipo de vehículo</label>
        <select {...register('tipo', { required: true })} className="input w-full">
          <option value="">-- Selecciona tipo --</option>
          {tipos.map((tipo) => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Placa</label>
        <input {...register('placa', { required: true })} className="input w-full" />
      </div>

      <div>
        <label>Estado inicial</label>
        <select {...register('estadoInicial', { required: true })} className="input w-full">
          <option value="">-- Selecciona estado --</option>
          <option value="nuevo">Nuevo</option>
          <option value="usado">Usado</option>
        </select>
      </div>

      <div>
        <label>Estado actual</label>
        <select {...register('estadoActual', { required: true })} className="input w-full">
          <option value="">-- Selecciona estado --</option>
          {estados.map((estado) => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Fecha de adquisición</label>
        <input type="date" {...register('fechaAdquisicion', { required: true })} className="input w-full" />
      </div>

      <div>
        <label>Kilometraje</label>
        <input
          type="number"
          {...register('kilometraje', { required: true, valueAsNumber: true, min: 0 })}
          className="input w-full"
        />
      </div>

      <div className="md:col-span-2">
        <label>URL de foto (opcional)</label>
        <input {...register('fotoUrl')} className="input w-full" />
      </div>

      <div className="md:col-span-2">
        <label>Observaciones (opcional)</label>
        <textarea {...register('observaciones')} className="input w-full" rows={3} />
      </div>

      <div className="md:col-span-2 text-right">
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Registrar vehículo
        </button>
      </div>
    </form>
  );
}
