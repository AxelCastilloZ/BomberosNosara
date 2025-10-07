// src/modules/inventarioVehiculos/components/addVehiculo.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehiculoCreateSchema, type VehiculoFormData } from '../../../components/common/schemas/vehiculos.validations';
import { useAddVehiculo } from '../hooks/useVehiculos';
import { useCrudNotifications } from '../../../hooks/useCrudNotifications';
import { TIPO_OPTIONS, ESTADO_OPTIONS, OBS_MAX, getTodayISO } from '../utils/vehiculoConstants';

export default function AddVehiculo({ onSuccess }: { onSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoCreateSchema),
    mode: 'onBlur',
    defaultValues: {
      placa: '',
      tipo: '',
      estadoInicial: '',
      estadoActual: '',
      fechaAdquisicion: '',
      kilometraje: 0,
      fotoUrl: '',
      observaciones: '',
    },
  });

  const addVehiculo = useAddVehiculo();
  const { notifyCreated, notifyError } = useCrudNotifications();

  const obsLen = (watch('observaciones') ?? '').length;
  const todayISO = getTodayISO();

  const onSubmit = (data: VehiculoFormData) => {
    // Preparar los datos en el formato que espera la API
    const payload = {
      placa: data.placa,
      tipo: data.tipo,
      estadoInicial: data.estadoInicial,
      estadoActual: data.estadoActual,
      fechaAdquisicion: data.fechaAdquisicion,
      kilometraje: Number(data.kilometraje) || 0,
      fotoUrl: data.fotoUrl || undefined,
      observaciones: data.observaciones || undefined,
    };
    
    addVehiculo.mutate(payload as any, {
      onSuccess: () => {
        notifyCreated('Vehículo');
        reset();
        onSuccess?.();
      },
      onError: (e: any) => {
        const message = e?.message || e?.response?.data?.message || 'Error al registrar vehículo';
        notifyError('crear vehículo', message);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Tipo de vehículo */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Tipo de vehículo <span className="text-red-500">*</span>
        </label>
        <select
          {...register('tipo')}
          className={`w-full border rounded px-3 py-2 ${
            errors.tipo ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">-- Selecciona tipo --</option>
          {TIPO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {errors.tipo && <p className="text-red-600 text-sm mt-1">{errors.tipo.message}</p>}
      </div>

      {/* Placa */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Placa <span className="text-red-500">*</span>
        </label>
        <input
          {...register('placa')}
          className={`w-full border rounded px-3 py-2 ${
            errors.placa ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ej: ABC-123"
        />
        {errors.placa && <p className="text-red-600 text-sm mt-1">{errors.placa.message}</p>}
      </div>

      {/* Estado inicial */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Estado inicial <span className="text-red-500">*</span>
        </label>
        <select
          {...register('estadoInicial')}
          className={`w-full border rounded px-3 py-2 ${
            errors.estadoInicial ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">-- Selecciona estado --</option>
          <option value="nuevo">Nuevo</option>
          <option value="usado">Usado</option>
        </select>
        {errors.estadoInicial && <p className="text-red-600 text-sm mt-1">{errors.estadoInicial.message}</p>}
      </div>

      {/* Estado actual */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Estado actual <span className="text-red-500">*</span>
        </label>
        <select
          {...register('estadoActual')}
          className={`w-full border rounded px-3 py-2 ${
            errors.estadoActual ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">-- Selecciona estado --</option>
          {ESTADO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {errors.estadoActual && <p className="text-red-600 text-sm mt-1">{errors.estadoActual.message}</p>}
      </div>

      {/* Fecha de adquisición */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Fecha de adquisición <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          max={todayISO}
          {...register('fechaAdquisicion')}
          className={`w-full border rounded px-3 py-2 ${
            errors.fechaAdquisicion ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.fechaAdquisicion && (
          <p className="text-red-600 text-sm mt-1">{errors.fechaAdquisicion.message}</p>
        )}
      </div>

      {/* Kilometraje */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Kilometraje <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="0"
          max="999999"
          step="1"
          {...register('kilometraje', { valueAsNumber: true })}
          className={`w-full border rounded px-3 py-2 ${
            errors.kilometraje ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="0"
        />
        {errors.kilometraje && <p className="text-red-600 text-sm mt-1">{errors.kilometraje.message}</p>}
      </div>

      {/* URL de foto */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">URL de foto (opcional)</label>
        <input
          type="url"
          {...register('fotoUrl')}
          className={`w-full border rounded px-3 py-2 ${
            errors.fotoUrl ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
        {errors.fotoUrl && <p className="text-red-600 text-sm mt-1">{errors.fotoUrl.message}</p>}
      </div>

      {/* Observaciones */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">Observaciones (opcional)</label>
        <textarea
          className={`w-full border rounded px-3 py-2 ${
            errors.observaciones ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={3}
          maxLength={OBS_MAX}
          {...register('observaciones')}
          placeholder="Información adicional sobre el vehículo..."
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.observaciones && (
            <p className="text-red-600 text-sm">{errors.observaciones.message}</p>
          )}
          <span className={`text-xs ml-auto ${obsLen > OBS_MAX * 0.9 ? 'text-orange-500' : 'text-slate-400'}`}>
            {obsLen}/{OBS_MAX}
          </span>
        </div>
      </div>

      {/* Botón submit */}
      <div className="md:col-span-2 text-right">
        <button
          type="submit"
          disabled={addVehiculo.isPending}
          className={`px-6 py-2 rounded text-white transition-colors ${
            addVehiculo.isPending 
              ? 'bg-green-600/60 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {addVehiculo.isPending ? 'Guardando…' : 'Registrar vehículo'}
        </button>
      </div>
    </form>
  );
}