import { Vehicle } from '../../../types/vehiculo.types';
import { getIconForType } from '../utils/vehiculoIcons';
import { 
  shortDate, 
  getEstadoColorBase, 
  getEstadoIcon 
} from '../utils/vehiculoHelpers';
import { 
  X, 
  Calendar, 
  Gauge, 
  FileText,
  Clock,
  User,
} from 'lucide-react';

export interface DetallesVehiculoProps {
  vehiculo: Vehicle;
  onClose: () => void;
}

export default function DetallesVehiculo({ vehiculo, onClose }: DetallesVehiculoProps) {
  const vehicleIcon = getIconForType(vehiculo.tipo, 'w-8 h-8');
  const EstadoIcon = getEstadoIcon(vehiculo.estadoActual);
  const estadoColor = getEstadoColorBase(vehiculo.estadoActual);

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header - Color rojo */}
      <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-lg z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
              {vehicleIcon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Detalles del Vehículo</h2>
              <p className="text-red-100 text-sm mt-1">Placa: {vehiculo.placa}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Foto del vehículo */}
        {vehiculo.fotoUrl && (
          <div className="flex justify-center">
            <img
              src={vehiculo.fotoUrl}
              alt={`Vehículo ${vehiculo.placa}`}
              className="max-w-md w-full h-64 object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Información básica */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            Información Básica
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Tipo de Vehículo:</span>
              <p className="text-gray-900 mt-1 capitalize">{vehiculo.tipo}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Estado Inicial:</span>
              <p className="text-gray-900 mt-1 capitalize">{vehiculo.estadoInicial}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Fecha de Adquisición:</span>
              <p className="text-gray-900 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                {shortDate(vehiculo.fechaAdquisicion)}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Kilometraje:</span>
              <p className="text-gray-900 mt-1 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-gray-500" />
                {vehiculo.kilometraje.toLocaleString()} km
              </p>
            </div>
          </div>
        </div>

        {/* Estado actual */}
        <div className={`bg-${estadoColor}-50 border border-${estadoColor}-200 rounded-lg p-4`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <EstadoIcon className={`w-5 h-5 text-${estadoColor}-600`} />
            Estado Actual
          </h3>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full bg-${estadoColor}-100 text-${estadoColor}-800 font-semibold text-sm capitalize`}>
              {vehiculo.estadoActual}
            </span>
          </div>
        </div>

        {/* Observaciones */}
        {vehiculo.observaciones && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Observaciones
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{vehiculo.observaciones}</p>
          </div>
        )}

        {/* Información de auditoría */}
        {(vehiculo.createdAt || vehiculo.updatedAt) && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Información de Registro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {vehiculo.createdAt && (
                <div>
                  <span className="text-gray-600">Creado el:</span>
                  <p className="text-gray-900 mt-1">{shortDate(vehiculo.createdAt)}</p>
                  {vehiculo.createdBy && (
                    <p className="text-gray-600 text-xs mt-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      por {vehiculo.createdBy}
                    </p>
                  )}
                </div>
              )}
              {vehiculo.updatedAt && (
                <div>
                  <span className="text-gray-600">Última actualización:</span>
                  <p className="text-gray-900 mt-1">{shortDate(vehiculo.updatedAt)}</p>
                  {vehiculo.updatedBy && (
                    <p className="text-gray-600 text-xs mt-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      por {vehiculo.updatedBy}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer con botón de cerrar */}
      <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-lg">
        <button
          onClick={onClose}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}