import api from '../../../api/apiConfig';
import type {
  MantenimientoProgramadoData,
  MantenimientoData,
  Vehicle,
  ReposicionData,
  ApiErrorPayload,
} from '../../../types/vehiculo.types';
import type { AxiosError } from 'axios';

function normalizeApiError(err: unknown): never {
  const axErr = err as AxiosError<ApiErrorPayload>;
  const payload = axErr?.response?.data;

  if (payload?.message || payload?.code) {
    const e = new Error(payload.message || 'Error de servidor');
    (e as any).code = payload.code;
    (e as any).field = payload.field;
    (e as any).status = axErr?.response?.status;
    (e as any).raw = payload;
    throw e;
  }

  const e = new Error(axErr?.message || 'Error de red o del servidor');
  (e as any).status = axErr?.response?.status;
  throw e;
}

export const vehiculoService = {
  // ---- Vehículos ----
  getAll: async (): Promise<Vehicle[]> => {
    try {
      const res = await api.get('/vehiculos');
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  getAllPaginated: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
  }): Promise<{
    data: Vehicle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.type && params.type !== 'all') queryParams.append('type', params.type);

      const res = await api.get(`/vehiculos?${queryParams.toString()}`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  create: async (vehiculo: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    try {
      const res = await api.post('/vehiculos', vehiculo);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  update: async (vehiculo: Partial<Vehicle> & { id: string }): Promise<Vehicle> => {
    try {
      const { id, ...data } = vehiculo;
      const res = await api.patch(`/vehiculos/${id}`, data);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  updateEstado: async (id: string, estadoActual: Vehicle['estadoActual']): Promise<Vehicle> => {
    try {
      const res = await api.put(`/vehiculos/${id}/estado`, { estadoActual });
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await api.delete(`/vehiculos/${id}`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  restore: async (id: string): Promise<Vehicle> => {
    try {
      const res = await api.post(`/vehiculos/${id}/restore`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ---- Reposición ----
  darDeBaja: async (id: string, motivo: string): Promise<Vehicle> => {
    try {
      const res = await api.patch(`/vehiculos/${id}/dar-de-baja`, { motivo });
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  registrarReposicion: async (id: string, data: ReposicionData): Promise<Vehicle> => {
    try {
      const res = await api.post(`/vehiculos/${id}/reposicion`, data);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ---- Mantenimientos ----
  registrarMantenimiento: async (id: string, data: MantenimientoData): Promise<any> => {
    try {
      const res = await api.post(`/vehiculos/${id}/historial`, data);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  programarMantenimiento: async (id: string, data: MantenimientoProgramadoData): Promise<Vehicle> => {
    try {
      const res = await api.put(`/vehiculos/${id}/mantenimiento`, data);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  cancelarMantenimientoProgramado: async (id: string): Promise<Vehicle> => {
    try {
      const res = await api.delete(`/vehiculos/${id}/mantenimiento-programado`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  getHistorial: async (id: string): Promise<any[]> => {
    try {
      const res = await api.get(`/vehiculos/${id}/historial`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ---- Mantenimientos - Soft Delete y Restauración ----
  deleteMantenimiento: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await api.delete(`/vehiculos/mantenimiento/${id}`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  restoreMantenimiento: async (id: string): Promise<any> => {
    try {
      const res = await api.post(`/vehiculos/mantenimiento/${id}/restore`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ---- Utilidades ----
  existsByPlaca: async (placa: string): Promise<{ exists: boolean }> => {
    try {
      const res = await api.get(`/vehiculos/placa/${placa}/exists`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },
};