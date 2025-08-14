import api from "../api/apiConfig";
import { CreateParticipacionDto, UpdateEstadoDto } from "../types/voluntarios";


export const voluntariadoService = {
  crear: (dto: CreateParticipacionDto) => {
  console.log('POST /voluntarios/participaciones', dto);
  return api.post('/voluntarios/participaciones', dto);
},

  listarMisParticipaciones: (estado?: string) =>
    api.get('/voluntarios/mis-participaciones', { params: { estado } }),
  
  listarTodas: (estado?: string) =>
    api.get('/voluntarios/participaciones', { params: { estado } }),

  actualizarEstado: (id: number, dto: UpdateEstadoDto) =>
    api.patch(`/voluntarios/participaciones/${id}/estado`, dto),

  obtenerHorasAprobadas: () => api.get('/voluntarios/mis-horas-Aprobadas'),
  obtenerHorasPendientes: () => api.get('/voluntarios/mis-horas-Pendientes'),
};