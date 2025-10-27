import { useState } from 'react';
import AdminParticipacionesCards from './AdminParticipacionesCards';
import { TipoActividad } from '../../../../types/voluntarios';
import { useParticipacionesPaginadas } from '../../../../hooks/useVoluntarios';

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
  // estado que se usa para hacer la consulta
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

  // estado temporal del formulario
  const [draftFiltros, setDraftFiltros] = useState<FiltrosForm>(filtros);

  const { data, isLoading } = useParticipacionesPaginadas(filtros);
  const totalPages = data?.totalPages ?? 1;

  const actualizarDraft = <K extends keyof FiltrosForm>(
    key: K,
    value: FiltrosForm[K]
  ) => setDraftFiltros((prev) => ({ ...prev, [key]: value }));

  const limpiarFiltros = () => {
    const base = {
      descripcion: '',
      voluntario: '',
      tipoActividad: undefined,
      fechaDesde: '',
      fechaHasta: '',
      estado: undefined,
      page: 1,
      limit: 6,
    };
    setDraftFiltros(base);
    setFiltros(base);
  };

  const aplicarFiltros = () => {
    setFiltros({ ...draftFiltros, page: 1 }); // aplica filtros al hook
  };

  return (
    <div className="w-full">
      {/* Filtros */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        {/* Buscar por descripción */}
        <input
          placeholder="Buscar por descripción"
          value={draftFiltros.descripcion}
          onChange={(e) => actualizarDraft('descripcion', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />

        {/* Nombre del voluntario */}
        <input
          placeholder="Nombre del voluntario"
          value={draftFiltros.voluntario}
          onChange={(e) => actualizarDraft('voluntario', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />

        {/* Tipo de actividad */}
        <select
          value={draftFiltros.tipoActividad ?? ''}
          onChange={(e) =>
            actualizarDraft(
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
          value={draftFiltros.fechaDesde}
          onChange={(e) => actualizarDraft('fechaDesde', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />

        {/* Fecha hasta */}
        <input
          type="date"
          value={draftFiltros.fechaHasta}
          onChange={(e) => actualizarDraft('fechaHasta', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />

        {/* Estado */}
        <select
          value={draftFiltros.estado ?? ''}
          onChange={(e) =>
            actualizarDraft('estado', (e.target.value as any) || undefined)
          }
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Todos los estados</option>
          <option value="aprobada">Aprobada</option>
          <option value="pendiente">Pendiente</option>
          <option value="rechazada">Rechazada</option>
        </select>

        {/* Botones */}
        <div className="flex gap-2">
          <button
            onClick={limpiarFiltros}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm"
          >
            Limpiar
          </button>
          <button
            onClick={aplicarFiltros}
            className="bg-gray-600 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm"
          >
            Aplicar
          </button>
        </div>
      </div>

      {/* Cards */}
      {isLoading ? (
        <p className="text-gray-600">Cargando...</p>
      ) : (
        <AdminParticipacionesCards data={data?.data ?? []} />
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 text-sm">
          <button
            onClick={() => setFiltros((f) => ({ ...f, page: f.page - 1 }))}
            disabled={filtros.page === 1}
            className={`px-4 py-2 rounded-lg ${
              filtros.page === 1
                ? 'bg-gray-200 text-gray-500'
                : 'bg-gray-600 text-white'
            }`}
          >
            Anterior
          </button>
          <span>
            Página <strong>{filtros.page}</strong> de{' '}
            <strong>{totalPages}</strong>
          </span>
          <button
            onClick={() => setFiltros((f) => ({ ...f, page: f.page + 1 }))}
            disabled={filtros.page === totalPages}
            className={`px-4 py-2 rounded-lg ${
              filtros.page === totalPages
                ? 'bg-gray-200 text-gray-500'
                : 'bg-gray-600 text-white'
            }`}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
