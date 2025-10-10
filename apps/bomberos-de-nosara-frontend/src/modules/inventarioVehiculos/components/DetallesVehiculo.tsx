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
import { useUserById } from '../../../hooks/users/useUsers';

export interface DetallesVehiculoProps {
  vehiculo: Vehicle;
  onClose: () => void;
}

export default function DetallesVehiculo({ vehiculo, onClose }: DetallesVehiculoProps) {
  const vehicleIcon = getIconForType(vehiculo.tipo, 'w-6 h-6 sm:w-8 sm:h-8');
  const EstadoIcon = getEstadoIcon(vehiculo.estadoActual);
  const estadoColor = getEstadoColorBase(vehiculo.estadoActual);

  // Hooks para obtener información de usuarios
  const { data: creator, isLoading: loadingCreator } = useUserById(vehiculo.createdBy);
  const { data: updater, isLoading: loadingUpdater } = useUserById(vehiculo.updatedBy);

  const creatorName = creator?.username || 'Usuario desconocido';
  const updaterName = updater?.username || creatorName;

  // Función para truncar texto
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
      {/* Header - Color rojo */}
      <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-4 sm:p-6 rounded-t-lg z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="bg-white/20 p-2 sm:p-3 rounded-lg flex-shrink-0">
              {vehicleIcon}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-bold">Detalles del Vehículo</h2>
              <p 
                className="text-red-100 text-xs sm:text-sm mt-1 truncate" 
                title={`Placa: ${vehiculo.placa}`}
              >
                Placa: {vehiculo.placa}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Foto del vehículo */}
        {vehiculo.fotoUrl && (
          <div className="flex justify-center">
            <img
              src={vehiculo.fotoUrl}
              alt={`Vehículo ${vehiculo.placa}`}
              className="max-w-full sm:max-w-md w-full h-48 sm:h-64 object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Información básica */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
            <span>Información Básica</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Tipo de Vehículo:</span>
              <p className="text-sm sm:text-base text-gray-900 mt-1 capitalize break-words">
                {vehiculo.tipo}
              </p>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Estado Inicial:</span>
              <p className="text-sm sm:text-base text-gray-900 mt-1 capitalize">
                {vehiculo.estadoInicial}
              </p>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Fecha de Adquisición:</span>
              <p className="text-sm sm:text-base text-gray-900 mt-1 flex items-center gap-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                <span>{shortDate(vehiculo.fechaAdquisicion)}</span>
              </p>
            </div>
            <div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">Kilometraje:</span>
              <p className="text-sm sm:text-base text-gray-900 mt-1 flex items-center gap-2">
                <Gauge className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                <span>{vehiculo.kilometraje.toLocaleString()} km</span>
              </p>
            </div>
          </div>
        </div>

        {/* Estado actual */}
        <div className={`bg-${estadoColor}-50 border border-${estadoColor}-200 rounded-lg p-3 sm:p-4`}>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <EstadoIcon className={`w-4 h-4 sm:w-5 sm:h-5 text-${estadoColor}-600 flex-shrink-0`} />
            <span>Estado Actual</span>
          </h3>
          <div className="flex items-center gap-3">
            <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-${estadoColor}-100 text-${estadoColor}-800 font-semibold text-xs sm:text-sm capitalize`}>
              {vehiculo.estadoActual}
            </span>
          </div>
        </div>

        {/* Observaciones */}
        {vehiculo.observaciones && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
              <span>Observaciones</span>
            </h3>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap break-words">
                {vehiculo.observaciones}
              </p>
            </div>
          </div>
        )}

        {/* Información de auditoría */}
        {(vehiculo.createdAt || vehiculo.updatedAt) && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
              <span>Información de Registro</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              {vehiculo.createdAt && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <span className="text-gray-600 font-medium">Creado el:</span>
                  <p className="text-gray-900 mt-1 font-semibold">
                    {shortDate(vehiculo.createdAt)}
                  </p>
                  {vehiculo.createdBy && (
                    <p className="text-gray-600 text-xs mt-2 flex items-center gap-1">
                      <User className="w-3 h-3 flex-shrink-0" />
                      {loadingCreator ? (
                        <span className="italic">Cargando...</span>
                      ) : (
                        <span className="truncate" title={`por ${creatorName}`}>
                          por {creatorName}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}
              {vehiculo.updatedAt && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <span className="text-gray-600 font-medium">Última actualización:</span>
                  <p className="text-gray-900 mt-1 font-semibold">
                    {shortDate(vehiculo.updatedAt)}
                  </p>
                  {vehiculo.updatedBy && (
                    <p className="text-gray-600 text-xs mt-2 flex items-center gap-1">
                      <User className="w-3 h-3 flex-shrink-0" />
                      {loadingUpdater ? (
                        <span className="italic">Cargando...</span>
                      ) : (
                        <span className="truncate" title={`por ${updaterName}`}>
                          por {updaterName}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer con botón de cerrar */}
      <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-3 sm:p-4 rounded-b-lg">
        <button
          onClick={onClose}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}