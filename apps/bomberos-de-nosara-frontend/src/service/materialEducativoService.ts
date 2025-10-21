import api from '../api/apiConfig';
import { MaterialEducativo } from '../interfaces/MaterialEducativo/material.interface';

export const materialService = {
  // Obtener todos los materiales
  getAll: async (): Promise<MaterialEducativo[]> => {
    const res = await api.get('/material-educativo');
    return res.data;
  },

  // Subir nuevo material (con archivo)
  upload: async (formData: FormData) => {
    // no pongas headers: Axios setea multipart con boundary
    return await api.post('/material-educativo', formData);
  },

  // Actualizar info (sin cambiar archivo)
  update: async (id: number, data: Partial<Omit<MaterialEducativo, 'id'>>) => {
    return await api.put(`/material-educativo/${id}`, data);
  },

  // Actualizar con archivo (multipart)
  updateWithFile: async (id: number, formData: FormData) => {
    return await api.put(`/material-educativo/${id}`, formData);
  },

  // Eliminar material
  delete: async (id: number) => {
    return await api.delete(`/material-educativo/${id}`);
  },

  // Descargar material (con token) -> blob
  download: async (id: number) => {
    return await api.get(`/material-educativo/${id}/download`, {
      responseType: 'blob',
    });
  },
};
