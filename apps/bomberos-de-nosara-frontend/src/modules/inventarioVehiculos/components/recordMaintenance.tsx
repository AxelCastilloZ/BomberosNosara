// src/modules/inventarioVehiculos/components/RecordMaintenance.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Types del módulo
import type { RecordMaintenanceProps } from '../types';

// Hooks del módulo
import { useVehiculos, useRegistrarMantenimiento } from '../hooks/useVehiculos';

// Sistema de notificaciones
import { useCrudNotifications } from '../../../hooks/useCrudNotifications';

// Schema de validación para registro de mantenimiento
const mantenimientoSchema = z.object({
  vehiculoId: z.string()
    .min(1, 'Debe seleccionar un vehículo'),

  fecha: z.string()
    .min(1, 'La fecha es obligatoria')
    .refine(
      (date) => {
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return inputDate <= today;
      },
      'La fecha no puede ser futura'
    ),

  descripcion: z.string()
    .min(1, 'La descripción es obligatoria')
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(200, 'La descripción no puede superar 200 caracteres')
    .transform(val => val.trim()),

  kilometraje: z.coerce
    .number()
    .int('Debe ser un número entero, sin decimales')
    .min(0, 'El kilometraje no puede ser negativo')
    .max(999999, 'El kilometraje no puede superar 999,999 km'),

  tecnico: z.string()
    .min(1, 'El técnico responsable es obligatorio')
    .min(3, 'El nombre del técnico debe tener al menos 3 caracteres')
    .max(100, 'El nombre del técnico no puede superar 100 caracteres')
    .transform(val => val.trim()),

  costo: z.coerce
    .number()
    .min(0, 'El costo no puede ser negativo')
    .max(99999999, 'El costo no puede superar ₡99,999,999'),

  observaciones: z.string()
    .max(500, 'Las observaciones no pueden superar 500 caracteres')
    .optional()
    .or(z.literal('')),
});

type MantenimientoFormData = z.input<typeof mantenimientoSchema>;

export default function RecordMaintenance({ vehiculoId, onClose }: RecordMaintenanceProps) {
  const { data: vehicles = [] } = useVehiculos();
  const registrarMantenimiento = useRegistrarMantenimiento();
  const { notifyCreated, notifyError } = useCrudNotifications();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MantenimientoFormData>({
    resolver: zodResolver(mantenimientoSchema),
    mode: 'onBlur',
    defaultValues: {
      vehiculoId: vehiculoId || '',
      fecha: '',
      descripcion: '',
      kilometraje: 0,
      tecnico: '',
      costo: 0,
      observaciones: '',
    },
  });

  const observaciones = watch('observaciones');
  const obsLen = (observaciones ?? '').length;

  const onSubmit = (data: MantenimientoFormData) => {
    registrarMantenimiento.mutate(
      {
        id: data.vehiculoId,
        data: {
          fecha: data.fecha,
          descripcion: data.descripcion,
          kilometraje: Number(data.kilometraje),
          tecnico: data.tecnico,
          costo: Number(data.costo),
          observaciones: data.observaciones || undefined,
        },
      },
      {
        onSuccess: () => {
          notifyCreated('Mantenimiento');
          onClose();
        },
        onError: (error: any) => {
          const message = error?.message || error?.response?.data?.message || 'Error al registrar mantenimiento';
          notifyError('registrar mantenimiento', message);
        }
      }
    );
  };

  // Obtener fecha máxima (hoy)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white border border-gray-300 shadow rounded-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">Registrar mantenimiento</h2>
      <p className="text-sm text-gray-500 mb-6">Completa los datos para registrar un mantenimiento realizado</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seleccionar vehículo */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar vehículo <span className="text-red-500">*</span>
            </label>
            <select
              {...register('vehiculoId')}
              className={`w-full border rounded px-3 py-2 ${
                errors.vehiculoId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">-- Seleccione --</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} - {v.tipo}
                </option>
              ))}
            </select>
            {errors.vehiculoId && (
              <p className="text-red-600 text-sm mt-1">{errors.vehiculoId.message}</p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              max={today}
              {...register('fecha')}
              className={`w-full border rounded px-3 py-2 ${
                errors.fecha ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.fecha && (
              <p className="text-red-600 text-sm mt-1">{errors.fecha.message}</p>
            )}
          </div>

          {/* Kilometraje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              placeholder="Ej: 45000"
            />
            {errors.kilometraje && (
              <p className="text-red-600 text-sm mt-1">{errors.kilometraje.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('descripcion')}
              className={`w-full border rounded px-3 py-2 ${
                errors.descripcion ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Cambio de aceite"
              maxLength={200}
            />
            {errors.descripcion && (
              <p className="text-red-600 text-sm mt-1">{errors.descripcion.message}</p>
            )}
          </div>

          {/* Técnico responsable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Técnico responsable <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('tecnico')}
              className={`w-full border rounded px-3 py-2 ${
                errors.tecnico ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Juan Pérez"
              maxLength={100}
            />
            {errors.tecnico && (
              <p className="text-red-600 text-sm mt-1">{errors.tecnico.message}</p>
            )}
          </div>

          {/* Costo */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Costo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₡</span>
              <input
                type="number"
                min="0"
                max="99999999"
                step="0.01"
                {...register('costo', { valueAsNumber: true })}
                className={`w-full border rounded px-3 py-2 pl-8 ${
                  errors.costo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.costo && (
              <p className="text-red-600 text-sm mt-1">{errors.costo.message}</p>
            )}
          </div>

          {/* Observaciones */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones (opcional)
            </label>
            <textarea
              {...register('observaciones')}
              className={`w-full border rounded px-3 py-2 ${
                errors.observaciones ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              maxLength={500}
              placeholder="Observaciones adicionales..."
            />
            <div className="flex items-center justify-between mt-1">
              {errors.observaciones && (
                <p className="text-red-600 text-sm">{errors.observaciones.message}</p>
              )}
              <span className={`text-xs ml-auto ${obsLen > 450 ? 'text-orange-500' : 'text-gray-500'}`}>
                {obsLen}/500 caracteres
              </span>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 text-white rounded transition-colors ${
              isSubmitting
                ? 'bg-red-600/60 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isSubmitting ? 'Guardando…' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  );
}