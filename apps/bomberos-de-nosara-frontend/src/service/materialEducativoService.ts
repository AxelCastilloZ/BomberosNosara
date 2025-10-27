// service/materialEducativoService.ts
import api from '../api/apiConfig';
import { MaterialEducativo } from '../interfaces/MaterialEducativo/material.interface';

export const materialService = {
  // 🔹 Obtener materiales con paginación y filtros (solo búsqueda por título)
  getAll: async (
    page: number,
    limit: number,
    search: string,
    filter: string,
    area: string
  ): Promise<{ data: MaterialEducativo[]; total: number }> => {
    // ⚙️ Construcción dinámica de parámetros (solo los que tienen valor)
    const params: Record<string, any> = { page, limit };

    // ✅ Ahora el backend recibe 'titulo' en vez de 'search'
    if (search && search.trim() !== '') params.titulo = search.trim();

    if (filter && filter.trim() !== '') params.tipo = filter.trim();
    if (area && area.trim() !== '') params.area = area.trim();

    const res = await api.get('/material-educativo', { params });
    return res.data;
  },

  // 🔹 Subir nuevo material
  upload: async (formData: FormData) => {
    return await api.post('/material-educativo', formData);
  },

  // 🔹 Actualizar info (sin archivo)
 
  update: async (id: number, data: Partial<Omit<MaterialEducativo, 'id'>>) => {
    return await api.put(`/material-educativo/${id}`, data);
  },

  // ✅ Editar con archivo
  updateWithFile: async (id: number, formData: FormData) => {
    return await api.put(`/material-educativo/${id}/file`, formData);
  },


  // 🔹 Eliminar
  delete: async (id: number) => {
    return await api.delete(`/material-educativo/${id}`);
  },

  // 🔹 Descargar material
  download: async (id: number) => {
    return await api.get(`/material-educativo/${id}/download`, {
      responseType: 'blob',
    });
  },
};
