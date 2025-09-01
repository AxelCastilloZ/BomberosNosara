import api from "../api/apiConfig";
import { Noticia } from "../types/news";



export const noticiaService = {
  // Obtener todas las noticias con filtros
  getAll: async (page = 1, limit = 10, search?: string, fechaDesde?: string, fechaHasta?: string) => {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;

    const response = await api.get('/noticias', { params });
    return response.data;
  },

  // Obtener una noticia por ID
  getById: async (id: number) => {
    const response = await api.get(`${'/noticias'}/${id}`);
    return response.data;
  },

  // Crear nueva noticia
  create: async (newNoticia: Omit<Noticia, 'id'>) => {
    const response = await api.post('/noticias', newNoticia);
    return response.data;
  },

  // Actualizar noticia existente
  update: async (id: number, updatedNoticia: Omit<Noticia, 'id'>) => {
    const response = await api.put(`${'/noticias'}/${id}`, updatedNoticia);
    return response.data;
  },

  // Eliminar noticia
  delete: async (id: number) => {
    const response = await api.delete(`${'/noticias'}/${id}`);
    return response.data;
  },
};