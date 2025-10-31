

// src/modules/inventarioEquipos/services/equipoBomberilService.ts

import api from '../../../api/apiConfig';
import type { AxiosError } from 'axios';
import type {
  EquipoBomberil,
  CreateEquipoDto,
  EditEquipoDto,
  UpdateEstadoDto,
  PaginatedEquipoQueryDto,
  PaginatedEquipoResponseDto,
} from '../../../types/equipoBomberil.types';
import type {
  MantenimientoEquipo,
  ProgramarMantenimientoDto,
  RegistrarMantenimientoDto,
  CompletarMantenimientoDto,
  EstadoMantenimiento,
  ReporteCostosMensuales,
  ReporteCostosPorEquipo,
} from '../../../types/mantenimientoEquipo.types';

// ==================== TYPES DE RESPUESTAS ====================

interface DeleteResponse {
  message: string;
}

interface ExistsResponse {
  exists: boolean;
}

interface ApiErrorPayload {
  code?: string;
  message?: string;
  field?: string;
}

// ==================== HELPER DE ERRORES ====================

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

// ==================== SERVICE ====================

export const equipoBomberilService = {
  // ==================== OPERACIONES BÁSICAS CRUD ====================

  getAll: async (): Promise<EquipoBomberil[]> => {
    try {
      const res = await api.get('/equipos');
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  getAllPaginated: async (params: PaginatedEquipoQueryDto): Promise<PaginatedEquipoResponseDto> => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.type) queryParams.append('type', params.type);

      const res = await api.get(`/equipos?${queryParams.toString()}`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  getAllWithDeleted: async (): Promise<EquipoBomberil[]> => {
    try {
      const res = await api.get('/equipos/with-deleted');
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  getOne: async (id: string): Promise<EquipoBomberil> => {
    try {
      const res = await api.get(`/equipos/${id}`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  create: async (equipo: CreateEquipoDto): Promise<EquipoBomberil> => {
    try {
      const res = await api.post('/equipos', equipo);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  edit: async (id: string, data: EditEquipoDto): Promise<EquipoBomberil> => {
    try {
      const res = await api.patch(`/equipos/${id}`, data);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ==================== SOFT DELETE Y RESTAURACIÓN ====================

  softDelete: async (id: string): Promise<DeleteResponse> => {
    try {
      const res = await api.delete(`/equipos/${id}`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  restore: async (id: string): Promise<EquipoBomberil> => {
    try {
      const res = await api.post(`/equipos/${id}/restore`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ==================== OPERACIONES ESPECIALES DE EQUIPO ====================

  updateEstado: async (id: string, data: UpdateEstadoDto): Promise<EquipoBomberil> => {
    try {
      const res = await api.patch(`/equipos/${id}/estado`, data);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  darDeBaja: async (id: string, motivo: string): Promise<EquipoBomberil> => {
    try {
      const res = await api.patch(`/equipos/${id}/dar-de-baja`, { motivo });
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ==================== MANTENIMIENTOS - PROGRAMAR/REGISTRAR/COMPLETAR ====================

  programarMantenimiento: async (equipoId: string, data: ProgramarMantenimientoDto): Promise<MantenimientoEquipo> => {
    try {
      const res = await api.post(`/equipos/${equipoId}/mantenimientos/programar`, data);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  registrarMantenimiento: async (equipoId: string, data: RegistrarMantenimientoDto): Promise<MantenimientoEquipo> => {
    try {
      const res = await api.post(`/equipos/${equipoId}/mantenimientos/registrar`, data);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  completarMantenimiento: async (mantenimientoId: string, data: CompletarMantenimientoDto): Promise<MantenimientoEquipo> => {
    try {
      const res = await api.patch(`/equipos/mantenimientos/${mantenimientoId}/completar`, data);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ==================== MANTENIMIENTOS - CAMBIAR ESTADO ====================

  cambiarEstadoMantenimiento: async (mantenimientoId: string, estado: EstadoMantenimiento): Promise<MantenimientoEquipo> => {
    try {
      const res = await api.patch(`/equipos/mantenimientos/${mantenimientoId}/estado`, { estado });
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ==================== MANTENIMIENTOS - CONSULTAS ====================

  obtenerHistorial: async (equipoId: string): Promise<MantenimientoEquipo[]> => {
    try {
      const res = await api.get(`/equipos/${equipoId}/mantenimientos/historial`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  obtenerProximoMantenimiento: async (equipoId: string): Promise<MantenimientoEquipo | null> => {
    try {
      const res = await api.get(`/equipos/${equipoId}/mantenimientos/proximo`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  obtenerTodosMantenimientos: async (): Promise<MantenimientoEquipo[]> => {
    try {
      const res = await api.get('/equipos/mantenimientos/todos');
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  obtenerMantenimientosPendientes: async (): Promise<MantenimientoEquipo[]> => {
    try {
      const res = await api.get('/equipos/mantenimientos/pendientes');
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  obtenerMantenimientosDelDia: async (): Promise<MantenimientoEquipo[]> => {
    try {
      const res = await api.get('/equipos/mantenimientos/del-dia');
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  obtenerMantenimientosParaNotificar: async (): Promise<MantenimientoEquipo[]> => {
    try {
      const res = await api.get('/equipos/mantenimientos/notificar');
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ==================== REPORTES DE COSTOS ====================

  obtenerCostosMensuales: async (mes: number, anio: number): Promise<ReporteCostosMensuales> => {
    try {
      const res = await api.get(`/equipos/reportes/costos-mensuales?mes=${mes}&anio=${anio}`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  obtenerCostosPorEquipo: async (equipoId: string, mes?: number, anio?: number): Promise<ReporteCostosPorEquipo> => {
    try {
      const queryParams = new URLSearchParams();
      if (mes) queryParams.append('mes', mes.toString());
      if (anio) queryParams.append('anio', anio.toString());

      const url = `/equipos/${equipoId}/reportes/costos${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const res = await api.get(url);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ==================== MANTENIMIENTOS - SOFT DELETE Y RESTAURACIÓN ====================

  softDeleteMantenimiento: async (id: string): Promise<DeleteResponse> => {
    try {
      const res = await api.delete(`/equipos/mantenimientos/${id}`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  restoreMantenimiento: async (id: string): Promise<MantenimientoEquipo> => {
    try {
      const res = await api.post(`/equipos/mantenimientos/${id}/restore`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ==================== UTILIDADES ====================

  existsByNumeroSerie: async (numeroSerie: string): Promise<ExistsResponse> => {
    try {
      const res = await api.get(`/equipos/numero-serie/${numeroSerie}/exists`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },
};