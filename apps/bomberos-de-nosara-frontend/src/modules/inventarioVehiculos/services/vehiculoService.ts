// src/modules/inventarioVehiculos/services/vehiculoService.ts
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
      const res = await api.patch(`/vehiculos/${id}`, data); // ← CORREGIDO: PATCH
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

  delete: async (id: string): Promise<{ success: true }> => {
    try {
      const res = await api.delete(`/vehiculos/${id}`);
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

  programarMantenimiento: async (id: string, data: MantenimientoProgramadoData): Promise<any> => {
    try {
      const res = await api.put(`/vehiculos/${id}/mantenimiento`, data);
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
};