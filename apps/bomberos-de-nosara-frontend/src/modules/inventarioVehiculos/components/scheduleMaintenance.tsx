// src/modules/inventarioVehiculos/components/ScheduleMaintenance.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

// Types globales
import type { Vehicle } from '../../../types/vehiculo.types';

// Types del módulo
import type { ScheduleMaintenanceProps } from '../types';

// Hooks del módulo
import { useVehiculos, useProgramarMantenimiento } from '../hooks/useVehiculos';

// Sistema de notificaciones
import { useCrudNotifications } from '../../../hooks/useCrudNotifications';

// Schema de validación para programar mantenimiento
const programarMantenimientoSchema = z.object({
  vehiculoId: z.string()
    .min(1, 'Debe seleccionar un vehículo'),

  fechaProximoMantenimiento: z.string()
    .min(1, 'La fecha es obligatoria')
    .refine(
      (date) => {
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return inputDate >= today;
      },
      'La fecha no puede ser anterior a hoy'
    ),

  tecnico: z.string()
    .min(1, 'El técnico responsable es obligatorio')
    .min(3, 'El nombre del técnico debe tener al menos 3 caracteres')
    .max(100, 'El nombre del técnico no puede superar 100 caracteres')
    .transform(val => val.trim()),

  tipo: z.string()
    .refine(
      (val) => ['preventivo', 'correctivo', 'inspección'].includes(val),
      'Tipo de mantenimiento inválido'
    ),

  prioridad: z.string()
    .refine(
      (val) => ['baja', 'media', 'alta'].includes(val),
      'Prioridad inválida'
    ),

  observaciones: z.string()
    .max(500, 'Las observaciones no pueden superar 500 caracteres')
    .optional()
    .or(z.literal('')),
});

type ProgramarMantenimientoFormData = z.input<typeof programarMantenimientoSchema>;

export default function ScheduleMaintenance({ vehiculoId, fechaActual, onClose }: ScheduleMaintenanceProps) {
  const { data: vehicles = [] } = useVehiculos();
  const programarMantenimiento = useProgramarMantenimiento();
  const { notifyCreated, notifyError } = useCrudNotifications();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProgramarMantenimientoFormData>({
    resolver: zodResolver(programarMantenimientoSchema),
    mode: 'onBlur',
    defaultValues: {
      vehiculoId: vehiculoId || '',
      fechaProximoMantenimiento: fechaActual || '',
      tecnico: '',
      tipo: 'preventivo',
      prioridad: 'media',
      observaciones: '',
    },
  });

  const selectedVehiculoId = watch('vehiculoId');
  const observaciones = watch('observaciones');
  const obsLen = (observaciones ?? '').length;

  // Encontrar vehículo seleccionado para mostrar info
  const vehiculoSeleccionado = vehicles.find((v) => v.id === selectedVehiculoId);

  // Si viene vehiculoId como prop, establecerlo
  useEffect(() => {
    if (vehiculoId && !selectedVehiculoId) {
      setValue('vehiculoId', vehiculoId);
    }
  }, [vehiculoId, selectedVehiculoId, setValue]);

  const onSubmit = (data: ProgramarMantenimientoFormData) => {
    programarMantenimiento.mutate(
      {
        id: data.vehiculoId,
        data: {
          fechaProximoMantenimiento: data.fechaProximoMantenimiento,
          tecnico: data.tecnico,
          tipo: data.tipo as 'preventivo' | 'correctivo' | 'inspección',
          prioridad: data.prioridad as 'baja' | 'media' | 'alta',
          observaciones: data.observaciones || undefined,
        },
      },
      { 
        onSuccess: () => {
          notifyCreated('Mantenimiento programado');
          onClose();
        },
        onError: (error: any) => {
          const message = error?.message || error?.response?.data?.message || 'Error al programar mantenimiento';
          notifyError('programar mantenimiento', message);
        }
      }
    );
  };

  // Fecha mínima (hoy)
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto bg-white border rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-1 text-gray-800">Programar mantenimiento</h2>
      <p className="text-sm text-gray-500 mb-6">
        Completa los detalles para agendar un próximo mantenimiento
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna 1 */}
          <div className="space-y-4">
            {/* Seleccionar vehículo - solo si no viene preseleccionado */}
            {!vehiculoId && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
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
            )}

            {/* Mostrar info del vehículo si está preseleccionado */}
            {vehiculoId && vehiculoSeleccionado && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900">Vehículo seleccionado</p>
                <p className="text-sm text-blue-700 mt-1">
                  {vehiculoSeleccionado.placa} - {vehiculoSeleccionado.tipo}
                </p>
              </div>
            )}

            {/* Técnico responsable */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Técnico responsable <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('tecnico')}
                className={`w-full border rounded px-3 py-2 ${
                  errors.tecnico ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nombre del técnico"
                maxLength={100}
              />
              {errors.tecnico && (
                <p className="text-red-600 text-sm mt-1">{errors.tecnico.message}</p>
              )}
            </div>

            {/* Tipo de mantenimiento */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tipo de mantenimiento <span className="text-red-500">*</span>
              </label>
              <select
                {...register('tipo')}
                className={`w-full border rounded px-3 py-2 ${
                  errors.tipo ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="preventivo">Preventivo</option>
                <option value="correctivo">Correctivo</option>
                <option value="inspección">Inspección</option>
              </select>
              {errors.tipo && (
                <p className="text-red-600 text-sm mt-1">{errors.tipo.message}</p>
              )}
            </div>
          </div>

          {/* Columna 2 */}
          <div className="space-y-4">
            {/* Fecha de mantenimiento */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Fecha de mantenimiento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={today}
                {...register('fechaProximoMantenimiento')}
                className={`w-full border rounded px-3 py-2 ${
                  errors.fechaProximoMantenimiento ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fechaProximoMantenimiento && (
                <p className="text-red-600 text-sm mt-1">{errors.fechaProximoMantenimiento.message}</p>
              )}
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Prioridad <span className="text-red-500">*</span>
              </label>
              <select
                {...register('prioridad')}
                className={`w-full border rounded px-3 py-2 ${
                  errors.prioridad ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
              {errors.prioridad && (
                <p className="text-red-600 text-sm mt-1">{errors.prioridad.message}</p>
              )}
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Observaciones (opcional)
              </label>
              <textarea
                {...register('observaciones')}
                className={`w-full border rounded px-3 py-2 ${
                  errors.observaciones ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                maxLength={500}
                placeholder="Notas adicionales..."
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
        </div>

        {/* Acciones */}
        <div className="mt-6 flex justify-end gap-3">
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
            {isSubmitting ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}