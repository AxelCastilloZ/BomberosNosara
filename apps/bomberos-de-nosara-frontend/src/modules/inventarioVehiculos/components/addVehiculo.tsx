// src/modules/inventarioVehiculos/components/addVehiculo.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAddVehiculo } from '../hooks/useVehiculos';
import { useCrudNotifications } from '../../../hooks/useCrudNotifications';
import { TIPO_OPTIONS, ESTADO_OPTIONS, getTodayISO } from '../utils/vehiculoConstants';

// Límites de caracteres
const FIELD_LIMITS = {
  placa: 50,
  fotoUrl: 500,
} as const;

// Schema con validaciones mejoradas
const vehiculoCreateSchema = z.object({
  placa: z.string()
    .transform(val => val.trim())
    .refine(
      val => val.length > 0,
      'La placa es obligatoria y no puede contener solo espacios'
    )
    .refine(
      val => val.length >= 3,
      'La placa debe tener al menos 3 caracteres'
    )
    .refine(
      val => val.length <= 50,
      'La placa no puede superar 50 caracteres'
    ),

  tipo: z.string()
    .min(1, 'Debe seleccionar un tipo de vehículo'),

  estadoInicial: z.string()
    .min(1, 'El estado inicial es obligatorio'),

  estadoActual: z.string()
    .min(1, 'El estado actual es obligatorio'),

  fechaAdquisicion: z.string()
    .min(1, 'La fecha de adquisición es obligatoria')
    .refine(
      (date) => {
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return inputDate <= today;
      },
      'La fecha de adquisición no puede ser futura'
    ),

  kilometraje: z.coerce
    .number()
    .int('Debe ser un número entero')
    .min(0, 'El kilometraje no puede ser negativo')
    .max(999999, 'El kilometraje no puede superar 999,999 km'),

  fotoUrl: z.string()
    .optional()
    .or(z.literal(''))
    .transform(val => val?.trim() || '')
    .refine(
      (val) => !val || z.string().url().safeParse(val).success,
      'Debe ser una URL válida'
    ),
}).refine(
  (data) => {
    // Validación: Si es nuevo, kilometraje debe ser 0
    if (data.estadoInicial === 'nuevo' && data.kilometraje !== 0) {
      return false;
    }
    return true;
  },
  {
    message: 'Un vehículo nuevo debe tener kilometraje de 0 km',
    path: ['kilometraje'],
  }
).refine(
  (data) => {
    // Validación: Si es usado, kilometraje debe ser mayor a 0
    if (data.estadoInicial === 'usado' && data.kilometraje === 0) {
      return false;
    }
    return true;
  },
  {
    message: 'Un vehículo usado debe tener kilometraje mayor a 0 km',
    path: ['kilometraje'],
  }
);

type VehiculoFormData = z.input<typeof vehiculoCreateSchema>;

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
    },
  });

  const addVehiculo = useAddVehiculo();
  const { notifyCreated, notifyError } = useCrudNotifications();

  const todayISO = getTodayISO();
  const fotoUrlValue = watch('fotoUrl');
  const placaValue = watch('placa');
  const estadoInicialValue = watch('estadoInicial');

  const onSubmit = (data: VehiculoFormData) => {
    const payload = {
      placa: data.placa,
      tipo: data.tipo,
      estadoInicial: data.estadoInicial,
      estadoActual: data.estadoActual,
      fechaAdquisicion: data.fechaAdquisicion,
      kilometraje: Number(data.kilometraje) || 0,
      fotoUrl: data.fotoUrl || undefined,
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
          maxLength={FIELD_LIMITS.placa}
          className={`w-full border rounded px-3 py-2 ${
            errors.placa ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ej: ABC-123"
        />
        <p className="text-xs text-gray-500 mt-1">
          {placaValue?.length || 0} / {FIELD_LIMITS.placa} caracteres
        </p>
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
          placeholder={estadoInicialValue === 'nuevo' ? '0' : 'Ej: 50000'}
        />
        {estadoInicialValue && (
          <p className="text-xs text-blue-600 mt-1">
            {estadoInicialValue === 'nuevo' 
              ? '⚠️ Vehículo nuevo debe tener 0 km' 
              : '⚠️ Vehículo usado debe tener más de 0 km'}
          </p>
        )}
        {errors.kilometraje && <p className="text-red-600 text-sm mt-1">{errors.kilometraje.message}</p>}
      </div>

      {/* URL de foto */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">URL de foto (opcional)</label>
        <input
          type="url"
          {...register('fotoUrl')}
          maxLength={FIELD_LIMITS.fotoUrl}
          className={`w-full border rounded px-3 py-2 ${
            errors.fotoUrl ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
        <p className="text-xs text-gray-500 mt-1">
          {fotoUrlValue?.length || 0} / {FIELD_LIMITS.fotoUrl} caracteres
        </p>
        {errors.fotoUrl && <p className="text-red-600 text-sm mt-1">{errors.fotoUrl.message}</p>}
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