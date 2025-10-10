import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { RecordMaintenanceProps } from '../types';
import type { Vehicle } from '../../../types/vehiculo.types';
import { useVehiculos, useRegistrarMantenimiento } from '../hooks/useVehiculos';
import { useCrudNotifications } from '../../../hooks/useCrudNotifications';

const mantenimientoSchema = z.object({
  vehiculoId: z.string().min(1, 'Debe seleccionar un vehículo'),
  fecha: z.string().min(1, 'La fecha es obligatoria').refine(
    (date) => new Date(date) <= new Date(),
    'La fecha no puede ser futura'
  ),
  descripcion: z.string().min(5, 'Mínimo 5 caracteres').max(200).transform(val => val.trim()),
  kilometraje: z.coerce.number().int().min(0).max(999999),
  tecnico: z.string().min(3).max(100).transform(val => val.trim()),
  costo: z.coerce.number().min(0).max(99999999),
  observaciones: z.string().max(500).optional().or(z.literal('')),
});

type MantenimientoFormData = z.input<typeof mantenimientoSchema>;

export default function RecordMaintenance({ vehiculoId, onClose }: RecordMaintenanceProps) {
  const { data: vehiclesResponse = [] } = useVehiculos();
  const registrarMantenimiento = useRegistrarMantenimiento();
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

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<MantenimientoFormData>({
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
          notifyError('registrar mantenimiento', error?.message || 'Error');
        }
      }
    );
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={onClose} 
        className="flex items-center gap-2 mb-8 text-red-600 hover:text-red-700 font-medium transition-colors"
      >
        <ArrowLeft className="h-5 w-5" /> Volver al menú de mantenimiento
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Registrar mantenimiento</h2>
        <p className="text-gray-500">Completa los datos del mantenimiento realizado</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="space-y-6">
            {/* Vehículo */}
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

            {/* Fecha y Kilometraje */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  max={today}
                  {...register('fecha')}
                  className={`w-full border rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.fecha ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.fecha && <p className="text-red-600 text-sm mt-1.5">{errors.fecha.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Kilometraje <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('kilometraje', { valueAsNumber: true })}
                  className={`w-full border rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.kilometraje ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="0"
                />
                {errors.kilometraje && <p className="text-red-600 text-sm mt-1.5">{errors.kilometraje.message}</p>}
              </div>
            </div>

            {/* Descripción y Técnico */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('descripcion')}
                  className={`w-full border rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.descripcion ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Cambio de aceite"
                />
                {errors.descripcion && <p className="text-red-600 text-sm mt-1.5">{errors.descripcion.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Técnico responsable <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('tecnico')}
                  className={`w-full border rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.tecnico ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Juan Pérez"
                />
                {errors.tecnico && <p className="text-red-600 text-sm mt-1.5">{errors.tecnico.message}</p>}
              </div>
            </div>

            {/* Costo */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Costo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₡</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('costo', { valueAsNumber: true })}
                  className={`w-full border rounded-xl px-4 py-3 pl-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.costo ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="0"
                />
              </div>
              {errors.costo && <p className="text-red-600 text-sm mt-1.5">{errors.costo.message}</p>}
            </div>

            {/* Observaciones */}
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

        {/* Botones */}
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
            {isSubmitting ? 'Guardando…' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  );
}