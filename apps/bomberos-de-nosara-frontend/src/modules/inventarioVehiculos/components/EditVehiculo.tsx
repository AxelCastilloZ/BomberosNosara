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

export default function EditVehiculo({ vehiculo, onClose, onSuccess }: EditVehiculoProps) {
  const { notifyUpdated, notifyDeleted, notifyError } = useCrudNotifications();

  // Estado del formulario
  const [formData, setFormData] = useState({
    placa: vehiculo.placa,
    tipo: vehiculo.tipo,
    estadoInicial: vehiculo.estadoInicial,
    fechaAdquisicion: vehiculo.fechaAdquisicion,
    kilometraje: vehiculo.kilometraje,
    fotoUrl: vehiculo.fotoUrl || '',
    observaciones: vehiculo.observaciones || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const vehicleIcon = getIconForType(formData.tipo, 'w-8 h-8');

  // Handler para cambios en el formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'kilometraje' ? Number(value) : value,
    }));
  };

  // Validaciones
  const validateForm = (): string | null => {
    if (!formData.placa.trim()) return 'La placa es obligatoria';
    if (formData.kilometraje < 0) return 'El kilometraje no puede ser negativo';
    if (formData.fechaAdquisicion > getTodayISO()) {
      return 'La fecha de adquisición no puede ser futura';
    }
    if (formData.observaciones.length > OBS_MAX) {
      return `Las observaciones no pueden exceder ${OBS_MAX} caracteres`;
    }
    return null;
  };

  // Handler para actualizar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      notifyError('validación', error);
      return;
    }

    setIsSubmitting(true);
    try {
      // Construir objeto de actualización SIN estadoInicial (es inmutable)
      const updateData: Partial<Vehicle> = {
        placa: formData.placa,
        tipo: formData.tipo,
        fechaAdquisicion: formData.fechaAdquisicion,
        kilometraje: formData.kilometraje,
      };

      // Solo incluir campos opcionales si tienen valor
      if (formData.fotoUrl.trim()) {
        updateData.fotoUrl = formData.fotoUrl;
      }

      if (formData.observaciones.trim()) {
        updateData.observaciones = formData.observaciones;
      }

      await vehiculoService.update({ id: vehiculo.id, ...updateData });
      notifyUpdated('Vehículo');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      notifyError('actualizar el vehículo', err.response?.data?.message);
    } finally {
      setIsSubmitting(false);
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
      notifyError('eliminar el vehículo', err.response?.data?.message);
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Placa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="placa"
              value={formData.placa}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Ej: ABC-123"
              required
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Vehículo <span className="text-red-500">*</span>
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            >
              {TIPO_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Estado Inicial - DESHABILITADO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado Inicial
            </label>
            <select
              name="estadoInicial"
              value={formData.estadoInicial}
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
              name="fechaAdquisicion"
              value={formData.fechaAdquisicion}
              onChange={handleChange}
              max={getTodayISO()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          {/* Kilometraje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kilometraje <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="kilometraje"
              value={formData.kilometraje}
              onChange={handleChange}
              min="0"
              step="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Ej: 15000"
              required
            />
          </div>

          {/* Foto URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              URL de la Foto (opcional)
            </label>
            <input
              type="url"
              name="fotoUrl"
              value={formData.fotoUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {formData.fotoUrl && (
              <div className="mt-3">
                <img
                  src={formData.fotoUrl}
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
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              maxLength={OBS_MAX}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              placeholder="Notas adicionales sobre el vehículo..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.observaciones.length}/{OBS_MAX} caracteres
            </p>
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
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
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
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
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