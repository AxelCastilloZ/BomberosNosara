import { useState, useEffect } from 'react';
import AdminParticipacionesCards from './AdminParticipacionesCards';
import { TipoActividad } from '../../types/voluntarios';
import { useParticipacionesPaginadas } from '../../Hooks/useVoluntarios';

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
    limit: 6,
  });

  // Estados temporales para debounce
  const [searchDesc, setSearchDesc] = useState('');
  const [searchVol, setSearchVol] = useState('');

  const { data, isLoading } = useParticipacionesPaginadas(filtros);
  const totalPages = data?.totalPages ?? 1;

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
      limit: 6,
    });
  };

   // Ordenar los datos: pendientes primero
  const datosOrdenados = data?.data
    ? [...data.data].sort((a, b) => {
        if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1;
        if (a.estado !== 'pendiente' && b.estado === 'pendiente') return 1;
        return 0;
      })
    : [];

  return (
    <div className="w-full">
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
            actualizarFiltro('estado', (e.target.value as '') || undefined)
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
      ) : datosOrdenados.length === 0 ? (
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
        <AdminParticipacionesCards data={datosOrdenados} />
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
    </div>
  );
}