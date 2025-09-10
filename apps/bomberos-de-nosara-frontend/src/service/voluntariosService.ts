import api from "../api/apiConfig";
import { CreateParticipacionDto, EstadisticasVoluntariosDto, PaginatedDto, PaginatedResponse, UpdateEstadoDto } from "../types/voluntarios";


export const voluntariadoService = {
  crear: (dto: CreateParticipacionDto) => {
  console.log('POST /voluntarios/participaciones', dto);
  return api.post('/voluntarios/participaciones', dto);
},

  // Lista las participaciones de cada viluntario
  listarMisParticipaciones: (estado?: string) =>
    api.get('/voluntarios/mis-participaciones', { params: { estado } }),
  
  // Método para que el admin liste todas las participaciones
  // listarTodas: (estado?: string) =>
  //   api.get('/voluntarios/participaciones', { params: { estado } }),

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
  obtenerEstadisticas: (): Promise<EstadisticasVoluntariosDto> =>
  api.get('/voluntarios/estadisticas').then((res) => res.data),

  
  listarPaginado: (params: PaginatedDto): Promise<PaginatedResponse> => {
    const cleaned = Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, v === '' ? undefined : v])
    );

    return api
      .get('/voluntarios/paginado', { params: cleaned })
      .then((res) => res.data);
  },
};