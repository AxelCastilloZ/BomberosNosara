import React from 'react';
import { useForm } from 'react-hook-form';
import type { Vehicle } from '../../../types/vehiculo.types';
import type { AddVehicleProps, FormValues } from '../types';
import { useAddVehiculo } from '../hooks/useVehiculos';
import { useCrudNotifications } from '../../../hooks/useCrudNotifications';
import { TIPO_OPTIONS, ESTADO_OPTIONS, OBS_MAX, getTodayISO } from '../utils/vehiculoConstants';

export default function AddVehiculo({ onSuccess }: AddVehicleProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ mode: 'onChange' });

  const addVehiculo = useAddVehiculo();
  const { notifyCreated, notifyError } = useCrudNotifications();

  const obsLen = (watch('observaciones') ?? '').length;
  const todayISO = getTodayISO();

  const onSubmit = (data: FormValues) => {
    const payload: FormValues = { ...data, placa: data.placa?.trim() };

    addVehiculo.mutate(payload, {
      onSuccess: () => {
        notifyCreated('Vehículo');
        reset();
        onSuccess?.();
      },
      onError: (e: any) => {
        const code = e?.code || e?.response?.data?.code;
        const message = e?.message || e?.response?.data?.message || 'Error al registrar vehículo';
        
        if (code === 'PLATE_EXISTS') {
          setError('placa', { 
            type: 'server', 
            message: message || 'La placa ya está registrada' 
          });
        }
        
        notifyError('crear vehículo', message);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">Tipo de vehículo</label>
        <select
          {...register('tipo', { required: 'El tipo es requerido' })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">-- Selecciona tipo --</option>
          {TIPO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {errors.tipo && <p className="text-red-600 text-sm mt-1">{errors.tipo.message as string}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Placa</label>
        <input
          {...register('placa', {
            required: 'La placa es requerida',
            minLength: { value: 3, message: 'La placa debe tener al menos 3 caracteres' },
          })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        {errors.placa && <p className="text-red-600 text-sm mt-1">{errors.placa.message as string}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Estado inicial</label>
        <select
          {...register('estadoInicial', { required: 'El estado inicial es requerido' })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">-- Selecciona estado --</option>
          <option value="nuevo">Nuevo</option>
          <option value="usado">Usado</option>
        </select>
        {errors.estadoInicial && <p className="text-red-600 text-sm mt-1">{errors.estadoInicial.message as string}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Estado actual</label>
        <select
          {...register('estadoActual', { required: 'El estado actual es requerido' })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">-- Selecciona estado --</option>
          {ESTADO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {errors.estadoActual && <p className="text-red-600 text-sm mt-1">{errors.estadoActual.message as string}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fecha de adquisición</label>
        <input
          type="date"
          max={todayISO}
          {...register('fechaAdquisicion', {
            required: 'La fecha de adquisición es requerida',
            validate: (value) => {
              if (!value) return 'La fecha de adquisición es requerida';
              return value <= todayISO || 'La fecha no puede ser mayor a hoy';
            },
          })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        {errors.fechaAdquisicion && (
          <p className="text-red-600 text-sm mt-1">{errors.fechaAdquisicion.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Kilometraje</label>
        <input
          type="number"
          {...register('kilometraje', {
            required: 'El kilometraje es requerido',
            valueAsNumber: true,
            min: { value: 0, message: 'El kilometraje no puede ser negativo' },
            validate: (v) =>
              (v !== undefined && v !== null && !Number.isNaN(v)) || 'Debe ser un número válido',
          })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        {errors.kilometraje && <p className="text-red-600 text-sm mt-1">{errors.kilometraje.message as string}</p>}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">URL de foto (opcional)</label>
        <input
          {...register('fotoUrl', {
            validate: (v) => !v || /^https?:\/\/.+/i.test(v) || 'Debe ser una URL válida (http/https)',
          })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        {errors.fotoUrl && <p className="text-red-600 text-sm mt-1">{errors.fotoUrl.message as string}</p>}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1" htmlFor="observaciones">
          Observaciones (opcional)
        </label>

        <textarea
          id="observaciones"
          className={`w-full border border-gray-300 rounded px-3 py-2 ${errors.observaciones ? 'ring-1 ring-red-500' : ''}`}
          rows={3}
          maxLength={OBS_MAX}
          {...register('observaciones', {
            maxLength: { value: OBS_MAX, message: `Máximo ${OBS_MAX} caracteres` },
          })}
        />

        <div className="mt-1 flex items-center justify-between">
          {(obsLen >= OBS_MAX || !!errors.observaciones) ? (
            <p className="text-red-600 text-sm">Máximo {OBS_MAX} caracteres</p>
          ) : <span />}
          <span className="text-xs text-slate-400">
            {obsLen}/{OBS_MAX}
          </span>
        </div>
      </div>

      <div className="md:col-span-2 text-right">
        <button
          type="submit"
          disabled={addVehiculo.isPending}
          className={`px-6 py-2 rounded text-white ${
            addVehiculo.isPending ? 'bg-green-600/60' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {addVehiculo.isPending ? 'Guardando…' : 'Registrar vehículo'}
        </button>
      </div>
    </form>
  );
}