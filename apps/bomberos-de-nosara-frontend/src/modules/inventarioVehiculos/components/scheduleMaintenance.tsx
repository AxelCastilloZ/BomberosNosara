import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { ScheduleMaintenanceProps } from '../types';
import type { Vehicle } from '../../../types/vehiculo.types';
import { useVehiculos, useProgramarMantenimiento } from '../hooks/useVehiculos';
import { useCrudNotifications } from '../../../hooks/useCrudNotifications';

const programarMantenimientoSchema = z.object({
  vehiculoId: z.string().min(1, 'Debe seleccionar un vehículo'),
  fechaProximoMantenimiento: z.string().min(1, 'La fecha es obligatoria'),
  tecnico: z.string().min(3).max(100).transform(val => val.trim()),
  tipo: z.string(),
  prioridad: z.string(),
  observaciones: z.string().max(500).optional().or(z.literal('')),
});

type ProgramarMantenimientoFormData = z.input<typeof programarMantenimientoSchema>;

export default function ScheduleMaintenance({ vehiculoId, fechaActual, onClose }: ScheduleMaintenanceProps) {
  const { data: vehiclesResponse = [] } = useVehiculos();
  const programarMantenimiento = useProgramarMantenimiento();
  const { notifyCreated, notifyError } = useCrudNotifications();

  // Extraer el array de vehículos correctamente
  const vehicles: Vehicle[] = useMemo(() => {
    if (Array.isArray(vehiclesResponse)) {
      return vehiclesResponse;
    }
    if (vehiclesResponse && 'data' in vehiclesResponse) {
      return vehiclesResponse.data;
    }
    return [];
  }, [vehiclesResponse]);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<ProgramarMantenimientoFormData>({
    resolver: zodResolver(programarMantenimientoSchema),
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

  useEffect(() => {
    if (vehiculoId && !selectedVehiculoId) setValue('vehiculoId', vehiculoId);
  }, [vehiculoId, selectedVehiculoId, setValue]);

  const onSubmit = (data: ProgramarMantenimientoFormData) => {
    programarMantenimiento.mutate(
      {
        id: data.vehiculoId,
        data: {
          fechaProximoMantenimiento: data.fechaProximoMantenimiento,
          tecnico: data.tecnico,
          tipo: data.tipo as any,
          prioridad: data.prioridad as any,
          observaciones: data.observaciones || undefined,
        },
      },
      { 
        onSuccess: () => {
          notifyCreated('Mantenimiento programado');
          onClose();
        },
        onError: (error: any) => {
          notifyError('programar mantenimiento', error?.message || 'Error');
        }
      }
    );
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={onClose} 
        className="flex items-center gap-2 mb-8 text-red-600 hover:text-red-700 font-medium transition-colors"
      >
        <ArrowLeft className="h-5 w-5" /> Volver al menú de mantenimiento
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Programar mantenimiento</h2>
        <p className="text-gray-500">Agenda el próximo mantenimiento del vehículo</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="space-y-6">
            {!vehiculoId && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Vehículo <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('vehiculoId')}
                  className={`w-full border rounded-xl px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.vehiculoId ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">-- Seleccione un vehículo --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.placa} - {v.tipo}</option>
                  ))}
                </select>
                {errors.vehiculoId && <p className="text-red-600 text-sm mt-1.5">{errors.vehiculoId.message}</p>}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={today}
                  {...register('fechaProximoMantenimiento')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Técnico <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('tecnico')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nombre del técnico"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('tipo')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="preventivo">Preventivo</option>
                  <option value="correctivo">Correctivo</option>
                  <option value="inspección">Inspección</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Prioridad <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('prioridad')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Observaciones (opcional)
              </label>
              <textarea
                {...register('observaciones')}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Notas adicionales..."
              />
              <p className={`text-xs mt-1.5 ${obsLen > 450 ? 'text-orange-500' : 'text-gray-400'}`}>
                {obsLen}/500 caracteres
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 text-white rounded-xl font-medium transition-colors ${
              isSubmitting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isSubmitting ? 'Guardando…' : 'Programar'}
          </button>
        </div>
      </form>
    </div>
  );
}