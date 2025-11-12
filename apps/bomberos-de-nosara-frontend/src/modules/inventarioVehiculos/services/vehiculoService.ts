// src/modules/inventarioVehiculos/services/vehiculoService.ts

import api from '../../../api/apiConfig';
import type { AxiosError } from 'axios';
import type {
  Vehiculo,
  CreateVehiculoDto,
  EditVehiculoDto,
  UpdateEstadoDto,
  PaginatedVehiculoQueryDto,
  PaginatedVehiculoResponseDto, // ✅ Corregido
} from '../../../types/vehiculo.types';
import type {
  Mantenimiento,
  ProgramarMantenimientoDto,
  RegistrarMantenimientoDto,
  CompletarMantenimientoDto,
  EstadoMantenimiento,
  ReporteCostosMensuales,
  ReporteCostosPorVehiculo,
  EditMantenimientoDto,
} from '../../../types/mantenimiento.types';

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
  
  throw err;
}

// ==================== SERVICE ====================

export const vehiculoService = {
  // ==================== OPERACIONES BÁSICAS CRUD ====================

  getAll: async (): Promise<Vehiculo[]> => {
    try {
      const res = await api.get('/vehiculos');
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  getAllPaginated: async (params: PaginatedVehiculoQueryDto): Promise<PaginatedVehiculoResponseDto> => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.type) queryParams.append('type', params.type);

      const res = await api.get(`/vehiculos?${queryParams.toString()}`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  getAllWithDeleted: async (): Promise<Vehiculo[]> => {
    try {
      const res = await api.get('/vehiculos/with-deleted');
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  getOne: async (id: string): Promise<Vehiculo> => {
    try {
      const res = await api.get(`/vehiculos/${id}`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },




getOneComplete: async (id: string): Promise<Vehiculo | null> => {
  try {
    const res = await api.get(`/vehiculos/${id}/complete`);
    return res.data;
  } catch (err) {
    normalizeApiError(err);
  }
},





  create: async (vehiculo: CreateVehiculoDto): Promise<Vehiculo> => {
    try {
      const res = await api.post('/vehiculos', vehiculo);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  edit: async (id: string, data: EditVehiculoDto): Promise<Vehiculo> => {
    try {
      const res = await api.patch(`/vehiculos/${id}`, data);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ==================== SOFT DELETE Y RESTAURACIÓN ====================

  softDelete: async (id: string): Promise<DeleteResponse> => {
    try {
      const res = await api.delete(`/vehiculos/${id}`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  restore: async (id: string): Promise<Vehiculo> => {
    try {
      const res = await api.post(`/vehiculos/${id}/restore`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ==================== OPERACIONES ESPECIALES DE VEHÍCULO ====================

  updateEstado: async (id: string, data: UpdateEstadoDto): Promise<Vehiculo> => {
    try {
      const res = await api.patch(`/vehiculos/${id}/estado`, data);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  darDeBaja: async (id: string, motivo: string): Promise<Vehiculo> => {
    try {
      const res = await api.patch(`/vehiculos/${id}/dar-de-baja`, { motivo });
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ==================== MANTENIMIENTOS - PROGRAMAR/REGISTRAR/COMPLETAR ====================

  programarMantenimiento: async (vehiculoId: string, data: ProgramarMantenimientoDto): Promise<Mantenimiento> => {
    try {
      const res = await api.post(`/vehiculos/${vehiculoId}/mantenimientos/programar`, data);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  registrarMantenimiento: async (vehiculoId: string, data: RegistrarMantenimientoDto): Promise<Mantenimiento> => {
    try {
      const res = await api.post(`/vehiculos/${vehiculoId}/mantenimientos/registrar`, data);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  completarMantenimiento: async (mantenimientoId: string, data: CompletarMantenimientoDto): Promise<Mantenimiento> => {
    try {
      const res = await api.patch(`/vehiculos/mantenimientos/${mantenimientoId}/completar`, data);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },



editarMantenimiento: async (mantenimientoId: string, data: EditMantenimientoDto): Promise<Mantenimiento> => {
  try {
    const res = await api.patch(`/vehiculos/mantenimientos/${mantenimientoId}/editar`, data);
    return res.data;
  } catch (err) {
    normalizeApiError(err);
  }
},






  // ==================== MANTENIMIENTOS - CAMBIAR ESTADO ====================

  cambiarEstadoMantenimiento: async (mantenimientoId: string, estado: EstadoMantenimiento): Promise<Mantenimiento> => {
    try {
      const res = await api.patch(`/vehiculos/mantenimientos/${mantenimientoId}/estado`, { estado });
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ==================== MANTENIMIENTOS - CONSULTAS ====================

  obtenerHistorial: async (vehiculoId: string): Promise<Mantenimiento[]> => {
    try {
      const res = await api.get(`/vehiculos/${vehiculoId}/mantenimientos/historial`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  obtenerProximoMantenimiento: async (vehiculoId: string): Promise<Mantenimiento | null> => {
    try {
      const res = await api.get(`/vehiculos/${vehiculoId}/mantenimientos/proximo`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  obtenerTodosMantenimientos: async (): Promise<Mantenimiento[]> => {
    try {
      const res = await api.get('/vehiculos/mantenimientos/todos');
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  obtenerMantenimientosPendientes: async (): Promise<Mantenimiento[]> => {
    try {
      const res = await api.get('/vehiculos/mantenimientos/pendientes');
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  obtenerMantenimientosDelDia: async (): Promise<Mantenimiento[]> => {
    try {
      const res = await api.get('/vehiculos/mantenimientos/del-dia');
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  obtenerMantenimientosParaNotificar: async (): Promise<Mantenimiento[]> => {
    try {
      const res = await api.get('/vehiculos/mantenimientos/notificar');
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ==================== REPORTES DE COSTOS ====================

  obtenerCostosMensuales: async (mes: number, anio: number): Promise<ReporteCostosMensuales> => {
    try {
      const res = await api.get(`/vehiculos/reportes/costos-mensuales?mes=${mes}&anio=${anio}`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  obtenerCostosPorVehiculo: async (vehiculoId: string, mes?: number, anio?: number): Promise<ReporteCostosPorVehiculo> => {
    try {
      const queryParams = new URLSearchParams();
      if (mes) queryParams.append('mes', mes.toString());
      if (anio) queryParams.append('anio', anio.toString());

      const url = `/vehiculos/${vehiculoId}/reportes/costos${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const res = await api.get(url);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ==================== MANTENIMIENTOS - SOFT DELETE Y RESTAURACIÓN ====================

  softDeleteMantenimiento: async (id: string): Promise<DeleteResponse> => {
    try {
      const res = await api.delete(`/vehiculos/mantenimientos/${id}`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },



   



  restoreMantenimiento: async (id: string): Promise<Mantenimiento> => {
    try {
      const res = await api.post(`/vehiculos/mantenimientos/${id}/restore`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },

  // ==================== UTILIDADES ====================

  existsByPlaca: async (placa: string): Promise<ExistsResponse> => {
    try {
      const res = await api.get(`/vehiculos/placa/${placa}/exists`);
      return res.data;
    } catch (err) {
      normalizeApiError(err);
    }
  },
};