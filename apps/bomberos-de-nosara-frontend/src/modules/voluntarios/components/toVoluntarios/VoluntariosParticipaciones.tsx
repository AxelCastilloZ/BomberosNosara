import { useState, useEffect } from 'react';
import VoluntarioCards from './VoluntarioCards';
import { TipoActividad } from '../../types/voluntarios';
import { useMisParticipacionesPaginadas } from '../../Hooks/useVoluntarios';

export type FiltrosVoluntarioForm = {
  descripcion?: string;
  tipoActividad?: TipoActividad;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: 'aprobada' | 'pendiente' | 'rechazada';
  page: number;
  limit: number;
};

export default function VoluntariosParticipaciones() {
  const [filtros, setFiltros] = useState<FiltrosVoluntarioForm>({
    descripcion: '',
    tipoActividad: undefined,
    fechaDesde: '',
    fechaHasta: '',
    estado: undefined,
    page: 1,
    limit: 6,
  });

  // Estado temporal solo para el campo de búsqueda (para debounce)
  const [searchText, setSearchText] = useState('');

  const { data, isLoading } = useMisParticipacionesPaginadas(filtros);
  const totalPages = data?.totalPages ?? 1;

  // Debounce para el campo de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros((prev) => ({ ...prev, descripcion: searchText, page: 1 }));
    }, 500); // Espera 500ms después de que el usuario deje de escribir

    return () => clearTimeout(timer);
  }, [searchText]);

  const actualizarFiltro = <K extends keyof FiltrosVoluntarioForm>(
    key: K,
    value: FiltrosVoluntarioForm[K]
  ) => {
    setFiltros((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const limpiarFiltros = () => {
    setSearchText('');
    setFiltros({
      descripcion: '',
      tipoActividad: undefined,
      fechaDesde: '',
      fechaHasta: '',
      estado: undefined,
      page: 1,
      limit: 6,
    });
  };

  return (
    <div className="w-full">
      {/* Filtros */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        {/* Buscar por descripción */}
        <input
          placeholder="Buscar por descripción"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
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
            actualizarFiltro('estado', (e.target.value as any) || undefined)
          }
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Todos los estados</option>
          <option value="aprobada">Aprobada</option>
          <option value="pendiente">Pendiente</option>
          <option value="rechazada">Rechazada</option>
        </select>

        {/* Botón Limpiar */}
        <div className="flex justify-end">
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
        <p className="text-center text-gray-600">Cargando...</p>
      ) : data?.data && data.data.length > 0 ? (
        <VoluntarioCards data={data.data} />
      ) : (
        <p className="text-center text-gray-500">No se encontraron participaciones</p>
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