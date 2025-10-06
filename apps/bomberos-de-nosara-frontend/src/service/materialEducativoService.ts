// service/materialEducativoService.ts
import api from '../api/apiConfig';
import { MaterialEducativo } from '../interfaces/MaterialEducativo/material.interface';

export const materialService = {
  // Obtener materiales con paginación y filtros
  getAll: async (
    page: number,
    limit: number,
    search: string,
    filter: string
  ): Promise<{ data: MaterialEducativo[]; total: number }> => {
    const res = await api.get('/material-educativo', {
      params: { page, limit, search, filter },
    });
    return res.data; // ⚡ backend debe responder { data: [], total }
  },

  // Subir nuevo material
  upload: async (formData: FormData) => {
    return await api.post('/material-educativo', formData);
  },

  // Actualizar info (sin archivo)
  update: async (id: number, data: Partial<Omit<MaterialEducativo, 'id'>>) => {
    return await api.put(`/material-educativo/${id}`, data);
  },

  // Actualizar con archivo
  updateWithFile: async (id: number, formData: FormData) => {
    return await api.put(`/material-educativo/${id}`, formData);
  },

  // Eliminar
  delete: async (id: number) => {
    return await api.delete(`/material-educativo/${id}`);
  },

  // Descargar material
  download: async (id: number) => {
    return await api.get(`/material-educativo/${id}/download`, {
      responseType: 'blob',
    });
  },
};
