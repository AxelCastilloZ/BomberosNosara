import React from 'react';
import { useForm } from 'react-hook-form';
import { useAddVehiculo } from '../../../../hooks/useVehiculos';
import type { Vehicle, TipoVehiculo, EstadoVehiculo } from '../../../../interfaces/Vehiculos/vehicle';

interface AddVehicleProps {
  onSuccess?: () => void;
}

type FormValues = Omit<Vehicle, 'id'>;

const tipos: TipoVehiculo[] = ['camión', 'ambulancia', 'pickup', 'moto', 'vehículo utilitario', 'otro'];
const estados: EstadoVehiculo[] = ['activo', 'en mantenimiento', 'dado de baja'];

// "Hoy" en YYYY-MM-DD para el atributo max del input date
const todayISO = new Date().toISOString().slice(0, 10);

export default function AddVehiculo({ onSuccess }: AddVehicleProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>();

  const addVehiculo = useAddVehiculo();

  const onSubmit = (data: FormValues) => {
    // (Opcional) normaliza placa (trim)
    const payload: FormValues = { ...data, placa: data.placa?.trim() };

    addVehiculo.mutate(payload, {
      onSuccess: () => {
        alert('Vehículo registrado correctamente');
        reset();
        onSuccess?.();
      },
      onError: (e: any) => {
        // Espera errores normalizados desde vehiculoService / backend
        const code = e?.code || e?.response?.data?.code;
        const field = e?.field || e?.response?.data?.field;
        const message = e?.message || e?.response?.data?.message || 'Error al registrar vehículo';

        if (code === 'PLATE_EXISTS') {
          // Muestra el error debajo del campo placa
          setError('placa', { type: 'server', message: message || 'La placa ya está registrada' });
          return;
        }
        alert(message);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label>Tipo de vehículo</label>
        <select
          {...register('tipo', { required: 'El tipo es requerido' })}
          className="input w-full"
        >
          <option value="">-- Selecciona tipo --</option>
          {tipos.map((tipo) => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
        {errors.tipo && <p className="text-red-600 text-sm mt-1">{errors.tipo.message}</p>}
      </div>

      <div>
        <label>Placa</label>
        <input
          {...register('placa', {
            required: 'La placa es requerida',
            minLength: { value: 3, message: 'La placa debe tener al menos 3 caracteres' },
            // (Opcional) patrón simple, ajusta según tu formato real
            // pattern: { value: /^[A-Za-z0-9-]{3,10}$/, message: 'Formato de placa inválido' },
          })}
          className="input w-full"
        />
        {errors.placa && <p className="text-red-600 text-sm mt-1">{errors.placa.message}</p>}
      </div>

      <div>
        <label>Estado inicial</label>
        <select
          {...register('estadoInicial', { required: 'El estado inicial es requerido' })}
          className="input w-full"
        >
          <option value="">-- Selecciona estado --</option>
          <option value="nuevo">Nuevo</option>
          <option value="usado">Usado</option>
        </select>
        {errors.estadoInicial && <p className="text-red-600 text-sm mt-1">{errors.estadoInicial.message}</p>}
      </div>

      <div>
        <label>Estado actual</label>
        <select
          {...register('estadoActual', { required: 'El estado actual es requerido' })}
          className="input w-full"
        >
          <option value="">-- Selecciona estado --</option>
          {estados.map((estado) => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
        {errors.estadoActual && <p className="text-red-600 text-sm mt-1">{errors.estadoActual.message}</p>}
      </div>

      <div>
        <label>Fecha de adquisición</label>
        <input
          type="date"
          max={todayISO}
          {...register('fechaAdquisicion', {
            required: 'La fecha de adquisición es requerida',
            validate: (value) => {
              if (!value) return 'La fecha de adquisición es requerida';
              return value <= todayISO || 'La fecha de adquisición no puede ser mayor a hoy';
            },
          })}
          className="input w-full"
        />
        {errors.fechaAdquisicion && (
          <p className="text-red-600 text-sm mt-1">{errors.fechaAdquisicion.message as string}</p>
        )}
      </div>

      <div>
        <label>Kilometraje</label>
        <input
          type="number"
          {...register('kilometraje', {
            required: 'El kilometraje es importante y es requerido',
            valueAsNumber: true,
            min: { value: 0, message: 'El kilometraje no puede ser negativo' },
            validate: (v) =>
              (v !== undefined && v !== null && !Number.isNaN(v)) || 'El kilometraje debe ser un número válido',
          })}
          className="input w-full"
        />
        {errors.kilometraje && <p className="text-red-600 text-sm mt-1">{errors.kilometraje.message}</p>}
      </div>

      <div className="md:col-span-2">
        <label>URL de foto (opcional)</label>
        <input
          {...register('fotoUrl', {
            validate: (v) => !v || /^https?:\/\/.+/i.test(v) || 'Debe ser una URL válida (http/https)',
          })}
          className="input w-full"
        />
        {errors.fotoUrl && <p className="text-red-600 text-sm mt-1">{errors.fotoUrl.message as string}</p>}
      </div>

      <div className="md:col-span-2">
        <label>Observaciones (opcional)</label>
        <textarea {...register('observaciones')} className="input w-full" rows={3} />
      </div>

      <div className="md:col-span-2 text-right">
        <button
          type="submit"
          disabled={addVehiculo.isPending}
          className={`px-6 py-2 rounded text-white ${addVehiculo.isPending ? 'bg-green-600/60' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {addVehiculo.isPending ? 'Guardando…' : 'Registrar vehículo'}
        </button>
      </div>
    </form>
  );
}
