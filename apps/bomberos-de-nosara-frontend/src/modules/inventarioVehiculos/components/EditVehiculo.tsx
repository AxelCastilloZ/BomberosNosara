import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Vehicle } from '../../../types/vehiculo.types';
import { useCrudNotifications } from '../../../hooks/useCrudNotifications';
import { getIconForType } from '../utils/vehiculoIcons';
import { getTodayISO, TIPO_OPTIONS } from '../utils/vehiculoConstants';
import {
  X,
  Save,
  Trash2,
  AlertTriangle,
  Image as ImageIcon,
  Calendar,
} from 'lucide-react';
import { 
  useUpdateVehiculo, 
  useDeleteVehiculo, 
  useCancelarMantenimientoProgramado 
} from '../hooks/useVehiculos';

export interface EditVehiculoProps {
  vehiculo: Vehicle;
  onClose: () => void;
  onSuccess?: () => void;
}

// Schema de validación para edición
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
});

type VehiculoEditFormData = z.input<typeof vehiculoEditSchema>;

export default function EditVehiculo({ vehiculo, onClose, onSuccess }: EditVehiculoProps) {
  const { notifyUpdated, notifyDeleted, notifyError } = useCrudNotifications();
  
  // React Query hooks
  const updateVehiculo = useUpdateVehiculo();
  const deleteVehiculo = useDeleteVehiculo();
  const cancelarMantenimiento = useCancelarMantenimientoProgramado();

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
    },
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMaintenanceWarning, setShowMaintenanceWarning] = useState(false);
  const [maintenanceDate, setMaintenanceDate] = useState<string>('');

  const fotoUrl = watch('fotoUrl');
  const tipo = watch('tipo');

  const vehicleIcon = getIconForType(tipo, 'w-8 h-8 text-white');

  // Handler para actualizar
  const onSubmit = async (data: VehiculoEditFormData) => {
    try {
      const payload: Partial<Vehicle> & { id: string } = {
        id: vehiculo.id,
        placa: data.placa,
        tipo: data.tipo as Vehicle['tipo'],
        fechaAdquisicion: data.fechaAdquisicion,
        kilometraje: Number(data.kilometraje) || 0,
        fotoUrl: data.fotoUrl || undefined,
      };

      await updateVehiculo.mutateAsync(payload);
      notifyUpdated('Vehículo');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const message = err?.message || 'Error al actualizar el vehículo';
      notifyError('actualizar el vehículo', message);
    }
  };

  // Handler para eliminar - con validación de mantenimiento programado
  const handleDeleteClick = async () => {
    try {
      await deleteVehiculo.mutateAsync(vehiculo.id);
      notifyDeleted('Vehículo');
      setShowDeleteModal(false);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      // Si tiene mantenimiento programado pendiente
      if (err?.code === 'HAS_SCHEDULED_MAINTENANCE') {
        const fecha = err?.raw?.details?.fechaProximoMantenimiento;
        setMaintenanceDate(fecha || '');
        setShowDeleteModal(false);
        setShowMaintenanceWarning(true);
      } else {
        const message = err?.message || 'Error al eliminar el vehículo';
        notifyError('eliminar el vehículo', message);
        setShowDeleteModal(false);
      }
    }
  };

  // Handler para cancelar mantenimiento y luego eliminar
  const handleCancelMaintenanceAndDelete = async () => {
    try {
      // 1. Cancelar mantenimiento programado
      await cancelarMantenimiento.mutateAsync(vehiculo.id);
      
      // 2. Eliminar vehículo
      await deleteVehiculo.mutateAsync(vehiculo.id);
      
      notifyDeleted('Vehículo');
      setShowMaintenanceWarning(false);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const message = err?.message || 'Error al procesar la solicitud';
      notifyError('eliminar el vehículo', message);
      setShowMaintenanceWarning(false);
    }
  };

  const isLoading = updateVehiculo.isPending || deleteVehiculo.isPending || cancelarMantenimiento.isPending;

  return (
    <>
      {/* Overlay del modal */}
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
          {/* Header con gradiente rojo */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-5 rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  {vehicleIcon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Editar Vehículo</h2>
                  <p className="text-red-100 text-sm mt-1">
                    {vehiculo.placa} • ID: {vehiculo.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                disabled={isLoading}
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Formulario con scroll */}
          <form onSubmit={handleSubmit(onSubmit)} className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="p-6 space-y-5">
              {/* Grid de 2 columnas para campos principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Placa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('placa')}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                      errors.placa ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Ej: ABC-123"
                  />
                  {errors.placa && (
                    <p className="text-red-600 text-sm mt-1.5">{errors.placa.message}</p>
                  )}
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Vehículo <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('tipo')}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                      errors.tipo ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    {TIPO_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.tipo && (
                    <p className="text-red-600 text-sm mt-1.5">{errors.tipo.message}</p>
                  )}
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
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                      errors.fechaAdquisicion ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.fechaAdquisicion && (
                    <p className="text-red-600 text-sm mt-1.5">{errors.fechaAdquisicion.message}</p>
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
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                      errors.kilometraje ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Ej: 15000"
                  />
                  {errors.kilometraje && (
                    <p className="text-red-600 text-sm mt-1.5">{errors.kilometraje.message}</p>
                  )}
                </div>
              </div>

              {/* Estado Inicial - DESHABILITADO - Ancho completo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado Inicial
                </label>
                <select
                  value={vehiculo.estadoInicial}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  disabled
                >
                  <option value="nuevo">Nuevo</option>
                  <option value="usado">Usado</option>
                </select>
                <p className="text-xs text-gray-500 mt-1.5">Este campo no se puede modificar</p>
              </div>

              {/* Foto URL - Ancho completo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  URL de la Foto (opcional)
                </label>
                <input
                  type="url"
                  {...register('fotoUrl')}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    errors.fotoUrl ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {errors.fotoUrl && (
                  <p className="text-red-600 text-sm mt-1.5">{errors.fotoUrl.message}</p>
                )}
                {fotoUrl && (
                  <div className="mt-3">
                    <img
                      src={fotoUrl}
                      alt="Vista previa"
                      className="max-w-full h-40 object-cover rounded-xl border border-gray-200 shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Error+al+cargar';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Zona de peligro */}
              <div className="border-t-2 border-gray-200 pt-5 mt-2">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-red-900 mb-1">
                        Zona de Peligro
                      </h3>
                      <p className="text-sm text-red-700 mb-3">
                        Al eliminar el vehículo se eliminarán también todos sus mantenimientos registrados.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar Vehículo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con botones - Sticky */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`flex-1 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  isLoading
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 hover:shadow-lg'
                }`}
                disabled={isLoading}
              >
                <Save className="w-5 h-5" />
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Confirmar Eliminación
              </h3>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">
              ¿Estás seguro de que deseas eliminar el vehículo con placa{' '}
              <span className="font-bold text-red-600">{vehiculo.placa}</span>?
              <br />
              <br />
              Se eliminarán <span className="font-semibold">todos los mantenimientos registrados</span> asociados a este vehículo.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteClick}
                className={`flex-1 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                  isLoading
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4" />
                {isLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de advertencia de mantenimiento programado */}
      {showMaintenanceWarning && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Mantenimiento Programado
              </h3>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">
              El vehículo <span className="font-bold text-red-600">{vehiculo.placa}</span> tiene un mantenimiento programado
              {maintenanceDate && (
                <span className="font-semibold"> para el {new Date(maintenanceDate).toLocaleDateString('es-CR')}</span>
              )}.
            </p>

            <p className="text-gray-700 mb-6 leading-relaxed">
              Para eliminarlo, primero debes <span className="font-semibold">cancelar el mantenimiento programado</span>.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMaintenanceWarning(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
                disabled={isLoading}
              >
                Volver
              </button>
              <button
                onClick={handleCancelMaintenanceAndDelete}
                className={`flex-1 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                  isLoading
                    ? 'bg-amber-400 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
                disabled={isLoading}
              >
                <Calendar className="w-4 h-4" />
                {isLoading ? 'Procesando...' : 'Cancelar y Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}