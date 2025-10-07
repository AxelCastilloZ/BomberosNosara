import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Vehicle } from '../../../types/vehiculo.types';
import { vehiculoService } from '../services/vehiculoService';
import { useCrudNotifications } from '../../../hooks/useCrudNotifications';
import { getIconForType } from '../utils/vehiculoIcons';
import { getTodayISO, TIPO_OPTIONS, OBS_MAX } from '../utils/vehiculoConstants';
import {
  X,
  Save,
  Trash2,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react';

export interface EditVehiculoProps {
  vehiculo: Vehicle;
  onClose: () => void;
  onSuccess?: () => void;
}

// Schema de validación para edición (sin estadoInicial que es inmutable)
const vehiculoEditSchema = z.object({
  placa: z.string()
    .min(1, 'La placa es obligatoria')
    .min(3, 'La placa debe tener al menos 3 caracteres')
    .max(50, 'La placa no puede superar 50 caracteres')
    .transform(val => val.trim()),

  tipo: z.string()
    .min(1, 'Debe seleccionar un tipo de vehículo')
    .refine(
      (val) => [
        'camión sisterna',
        'carro ambulancia',
        'pickup utilitario',
        'moto',
        'atv',
        'jet ski',
        'lancha rescate',
        'dron reconocimiento'
      ].includes(val),
      'Tipo de vehículo inválido'
    ),

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
    .int('Debe ser un número entero, sin decimales')
    .min(0, 'El kilometraje no puede ser negativo')
    .max(999999, 'El kilometraje no puede superar 999,999 km'),

  fotoUrl: z.string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || z.string().url().safeParse(val).success,
      'Debe ser una URL válida'
    ),

  observaciones: z.string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || val.length <= 500,
      'Las observaciones no pueden superar 500 caracteres'
    ),
});

type VehiculoEditFormData = z.input<typeof vehiculoEditSchema>;

export default function EditVehiculo({ vehiculo, onClose, onSuccess }: EditVehiculoProps) {
  const { notifyUpdated, notifyDeleted, notifyError } = useCrudNotifications();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VehiculoEditFormData>({
    resolver: zodResolver(vehiculoEditSchema),
    mode: 'onBlur',
    defaultValues: {
      placa: vehiculo.placa,
      tipo: vehiculo.tipo,
      fechaAdquisicion: vehiculo.fechaAdquisicion,
      kilometraje: vehiculo.kilometraje,
      fotoUrl: vehiculo.fotoUrl || '',
      observaciones: vehiculo.observaciones || '',
    },
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fotoUrl = watch('fotoUrl');
  const observaciones = watch('observaciones');
  const tipo = watch('tipo');
  const obsLen = (observaciones ?? '').length;

  const vehicleIcon = getIconForType(tipo, 'w-8 h-8');

  // Handler para actualizar
  const onSubmit = async (data: VehiculoEditFormData) => {
    try {
      // Construir objeto de actualización SIN estadoInicial (es inmutable)
      const payload = {
        placa: data.placa,
        tipo: data.tipo,
        fechaAdquisicion: data.fechaAdquisicion,
        kilometraje: Number(data.kilometraje) || 0,
        fotoUrl: data.fotoUrl || undefined,
        observaciones: data.observaciones || undefined,
      };

      await vehiculoService.update({ id: vehiculo.id, ...payload } as any);
      notifyUpdated('Vehículo');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Error al actualizar el vehículo';
      notifyError('actualizar el vehículo', message);
    }
  };

  // Handler para eliminar
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await vehiculoService.delete(vehiculo.id);
      notifyDeleted('Vehículo');
      setShowDeleteModal(false);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Error al eliminar el vehículo';
      notifyError('eliminar el vehículo', message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header - Color rojo */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-lg z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                {vehicleIcon}
              </div>
              <div>
                <h2 className="text-2xl font-bold">Editar Vehículo</h2>
                <p className="text-red-100 text-sm mt-1">ID: {vehiculo.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Placa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('placa')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.placa ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: ABC-123"
            />
            {errors.placa && (
              <p className="text-red-600 text-sm mt-1">{errors.placa.message}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Vehículo <span className="text-red-500">*</span>
            </label>
            <select
              {...register('tipo')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.tipo ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {TIPO_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.tipo && (
              <p className="text-red-600 text-sm mt-1">{errors.tipo.message}</p>
            )}
          </div>

          {/* Estado Inicial - DESHABILITADO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado Inicial
            </label>
            <select
              value={vehiculo.estadoInicial}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              disabled
            >
              <option value="nuevo">Nuevo</option>
              <option value="usado">Usado</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Este campo no se puede modificar</p>
          </div>

          {/* Fecha de Adquisición */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Adquisición <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('fechaAdquisicion')}
              max={getTodayISO()}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.fechaAdquisicion ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.fechaAdquisicion && (
              <p className="text-red-600 text-sm mt-1">{errors.fechaAdquisicion.message}</p>
            )}
          </div>

          {/* Kilometraje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kilometraje <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register('kilometraje', { valueAsNumber: true })}
              min="0"
              max="999999"
              step="1"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.kilometraje ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: 15000"
            />
            {errors.kilometraje && (
              <p className="text-red-600 text-sm mt-1">{errors.kilometraje.message}</p>
            )}
          </div>

          {/* Foto URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              URL de la Foto (opcional)
            </label>
            <input
              type="url"
              {...register('fotoUrl')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.fotoUrl ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {errors.fotoUrl && (
              <p className="text-red-600 text-sm mt-1">{errors.fotoUrl.message}</p>
            )}
            {fotoUrl && (
              <div className="mt-3">
                <img
                  src={fotoUrl}
                  alt="Vista previa"
                  className="max-w-xs h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Error+al+cargar';
                  }}
                />
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones (opcional)
            </label>
            <textarea
              {...register('observaciones')}
              maxLength={OBS_MAX}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none ${
                errors.observaciones ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Notas adicionales sobre el vehículo..."
            />
            <div className="flex items-center justify-between mt-1">
              {errors.observaciones && (
                <p className="text-red-600 text-sm">{errors.observaciones.message}</p>
              )}
              <span className={`text-xs ml-auto ${obsLen > OBS_MAX * 0.9 ? 'text-orange-500' : 'text-gray-500'}`}>
                {obsLen}/{OBS_MAX} caracteres
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-red-600/60 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              disabled={isSubmitting}
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

          {/* Zona de peligro */}
          <div className="border-t-2 border-red-200 pt-6 mt-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-1">
                    Zona de Peligro
                  </h3>
                  <p className="text-sm text-red-700 mb-4">
                    Esta acción eliminará el vehículo de forma permanente. Esta acción no se puede deshacer.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar Vehículo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Confirmar Eliminación
              </h3>
            </div>

            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas eliminar el vehículo con placa{' '}
              <span className="font-bold">{vehiculo.placa}</span>?
              <br />
              <br />
              Esta acción <span className="font-semibold text-red-600">no se puede deshacer</span>.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className={`flex-1 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  isDeleting
                    ? 'bg-red-600/60 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}