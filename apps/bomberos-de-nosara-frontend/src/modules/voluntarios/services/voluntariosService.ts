import api from "../../../api/apiConfig";
import { CreateParticipacionDto, EstadisticasVoluntariosDto, PaginatedDto, PaginatedResponse, UpdateEstadoDto } from "../types/voluntarios";


export const voluntariadoService = {
  crear: (dto: CreateParticipacionDto) => {
  console.log('POST /voluntarios/participaciones', dto);
  return api.post('/voluntarios/participaciones', dto);
},

  // Lista las participaciones de cada voluntario -- to delete
  listarMisParticipaciones: (estado?: string) =>
    api.get('/voluntarios/mis-participaciones', { params: { estado } }),

  // Método para listar participaciones del voluntario paginadas y filtradas
  listarMisParticipacionesPaginadas: (params: PaginatedDto): Promise<PaginatedResponse> => {
  const cleaned = Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, v === '' ? undefined : v])
  );

  return api
    .get('/voluntarios/mis-participaciones/paginado', { params: cleaned })
    .then((res) => res.data);
},

  // Método para actualizar el estado de una participación
  actualizarEstado: (id: number, dto: UpdateEstadoDto) =>
    api.patch(`/voluntarios/participaciones/${id}/estado`, dto),

  // Método para obtener horas aprobadas
  obtenerHorasAprobadas: () => 
    api.get('/voluntarios/mis-horas-Aprobadas'),

  // Método para obtener horas pendientes
  obtenerHorasPendientes: () => 
    api.get('/voluntarios/mis-horas-Pendientes'),

  // Método para obtener estadísticas generales
  obtenerEstadisticasGenerales: (): Promise<EstadisticasVoluntariosDto> =>
  api.get('/voluntarios/estadisticas/generales').then((res) => res.data),

  // Método para obtener estadísticas mensuales para el dashboard del admin
obtenerEstadisticasMensuales: (mes: string) =>
  api.get(`/voluntarios/estadisticas/mensuales`, { params: { mes } }).then((res) => res.data),
  
  // Método para listar participaciones paginadas y filtradas (solo para admin)
  listarPaginado: (params: PaginatedDto): Promise<PaginatedResponse> => {
    const cleaned = Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, v === '' ? undefined : v])
    );

    return api
      .get('/voluntarios/paginado', { params: cleaned })
      .then((res) => res.data);
  },
};