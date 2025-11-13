import { useState, useEffect } from 'react';
import AdminParticipacionesCards from './AdminParticipacionesCards';
import { TipoActividad } from '../../types/voluntarios';
import { useParticipacionesPaginadas } from '../../Hooks/useVoluntarios';
import { Alert, AlertDescription } from '../../../../components/ui/alert';

export type FiltrosForm = {
  descripcion?: string;
  voluntario?: string;
  tipoActividad?: TipoActividad;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: 'aprobada' | 'pendiente' | 'rechazada';
  page: number;
  limit: number;
};

export default function AdminParticipacionesFilt() {
  const [filtros, setFiltros] = useState<FiltrosForm>({
    descripcion: '',
    voluntario: '',
    tipoActividad: undefined,
    fechaDesde: '',
    fechaHasta: '',
    estado: undefined,
    page: 1,
    limit: 12,
  });

  // Estados temporales para debounce
  const [searchDesc, setSearchDesc] = useState('');
  const [searchVol, setSearchVol] = useState('');

  // Estados para alertas
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successAlertType, setSuccessAlertType] = useState<'aprobada' | 'rechazada'>('aprobada');
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { data, isLoading } = useParticipacionesPaginadas(filtros);
  const totalPages = data?.totalPages ?? 1;

  const handleSuccess = (tipoEstado: 'aprobada' | 'rechazada') => {
    setSuccessAlertType(tipoEstado);
    setShowSuccessAlert(true);
    setShowErrorAlert(false);

    // Ocultar alerta después de 2s
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 2000);
  };

  const handleError = (message: string) => {
    setErrorMessage(message);
    setShowErrorAlert(true);
    setShowSuccessAlert(false);

    // Ocultar alerta después de 30s
    setTimeout(() => {
      setShowErrorAlert(false);
    }, 30000);
  };

  // Debounce para descripción
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros((prev) => ({ ...prev, descripcion: searchDesc, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchDesc]);

  // Debounce para voluntario
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros((prev) => ({ ...prev, voluntario: searchVol, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchVol]);

  const actualizarFiltro = <K extends keyof FiltrosForm>(
    key: K,
    value: FiltrosForm[K]
  ) => {
    setFiltros((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const limpiarFiltros = () => {
    setSearchDesc('');
    setSearchVol('');
    setFiltros({
      descripcion: '',
      voluntario: '',
      tipoActividad: undefined,
      fechaDesde: '',
      fechaHasta: '',
      estado: undefined,
      page: 1,
      limit: 12,
    });
  };

  return (
    <div className="w-full">
      {/* Alertas flotantes */}
      {showSuccessAlert && (
        <div className="fixed top-4 right-4 z-[9999] w-96 animate-[slideInRight_0.3s_ease-out]">
          <Alert variant={successAlertType === 'aprobada' ? 'success' : 'warning'}>
            <AlertDescription>
              {successAlertType === 'aprobada' ? (
                <>
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong className="font-semibold">¡Participación aprobada!</strong>
                    <p className="mt-1">El estado se ha actualizado correctamente.</p>
                  </div>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <strong className="font-semibold">Participación rechazada</strong>
                    <p className="mt-1">El estado se ha actualizado correctamente.</p>
                  </div>
                </>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {showErrorAlert && (
        <div className="fixed top-4 right-4 z-[9999] w-96 animate-[slideInRight_0.3s_ease-out]">
          <Alert variant="destructive">
            <AlertDescription>
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <strong className="font-semibold">Error al actualizar</strong>
                <p className="mt-1">{errorMessage}</p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow border  p-4 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        {/* Buscar por descripción */}
        <input
          placeholder="Buscar por descripción"
          value={searchDesc}
          onChange={(e) => setSearchDesc(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />

        {/* Nombre del voluntario */}
        <input
          placeholder="Nombre del voluntario"
          value={searchVol}
          onChange={(e) => setSearchVol(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />

        {/* Tipo de actividad */}
        <select
          value={filtros.tipoActividad ?? ''}
          onChange={(e) =>
            actualizarFiltro(
              'tipoActividad',
              (e.target.value as TipoActividad) || undefined,
            )
          }
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Todas las actividades</option>
          <option value={TipoActividad.ENTRENAMIENTO}>ENTRENAMIENTO</option>
          <option value={TipoActividad.EMERGENCIA}>EMERGENCIA</option>
          <option value={TipoActividad.SIMULACROS}>SIMULACROS</option>
        </select>

        {/* Fecha desde */}
        <input
          type="date"
          value={filtros.fechaDesde}
          onChange={(e) => actualizarFiltro('fechaDesde', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />

        {/* Fecha hasta */}
        <input
          type="date"
          value={filtros.fechaHasta}
          onChange={(e) => actualizarFiltro('fechaHasta', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />

        {/* Estado */}
        <select
          value={filtros.estado ?? ''}
          onChange={(e) =>
            actualizarFiltro('estado', e.target.value === '' ? undefined : e.target.value as 'aprobada' | 'pendiente' | 'rechazada')
          }
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Todos los estados</option>
          <option value="aprobada">Aprobada</option>
          <option value="pendiente">Pendiente</option>
          <option value="rechazada">Rechazada</option>
        </select>

        {/* Botón Limpiar */}
        <div className="flex justify-end md:col-span-2 lg:col-span-3">
          <button
            onClick={limpiarFiltros}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Cards */}
      {isLoading ? (
        <p className="text-gray-600">Cargando...</p>
      ) : (data?.data ?? []).length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow border border-gray-200">
          <div className="flex flex-col items-center justify-center">
            <svg
              className="h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No hay participaciones registradas
            </h3>
            <p className="text-sm text-gray-500">
              No se encontraron participaciones con los filtros aplicados.
            </p>
          </div>
        </div>
      ) : (
        <AdminParticipacionesCards
          data={data?.data ?? []}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-3 mt-6">
          <button
            onClick={() => setFiltros((f) => ({ ...f, page: f.page - 1 }))}
            disabled={filtros.page === 1}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filtros.page === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Anterior
          </button>
          
          <span className="text-gray-700 text-sm font-medium">
            Página {filtros.page} de {totalPages}
          </span>
          
          <button
            onClick={() => setFiltros((f) => ({ ...f, page: f.page + 1 }))}
            disabled={filtros.page === totalPages}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filtros.page === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Siguiente
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}