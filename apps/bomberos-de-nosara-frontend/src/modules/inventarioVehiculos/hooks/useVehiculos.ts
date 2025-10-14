import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiculoService } from '../services/vehiculoService';
import type {
  Vehiculo,
  CreateVehiculoDto,
  EditVehiculoDto,
  UpdateEstadoDto,
  PaginatedVehiculoQueryDto,
} from '../../../types/vehiculo.types';
import type {
  Mantenimiento,
  ProgramarMantenimientoDto,
  RegistrarMantenimientoDto,
  CompletarMantenimientoDto,
  EstadoMantenimiento,
  ReporteCostosMensuales,
  ReporteCostosPorVehiculo,
} from '../../../types/mantenimiento.types';
import type {
  PaginatedVehiculoResponse,
  DeleteResponse,
  ExistsResponse,
} from '../../../types/api-responses.types';

// ==================== QUERY KEYS ====================

const VEHICULOS_KEY = ['vehiculos'] as const;
const HISTORIAL_KEY = (id: string) => ['vehiculos', id, 'historial'] as const;
const PROXIMO_MANTENIMIENTO_KEY = (id: string) => ['vehiculos', id, 'proximo-mantenimiento'] as const;
const MANTENIMIENTOS_PENDIENTES_KEY = ['mantenimientos', 'pendientes'] as const;
const MANTENIMIENTOS_DEL_DIA_KEY = ['mantenimientos', 'del-dia'] as const;
const TODOS_MANTENIMIENTOS_KEY = ['mantenimientos', 'todos'] as const;
const COSTOS_MENSUALES_KEY = (mes: number, anio: number) => ['reportes', 'costos-mensuales', mes, anio] as const;
const COSTOS_VEHICULO_KEY = (id: string, mes?: number, anio?: number) => 
  ['reportes', 'costos-vehiculo', id, mes, anio] as const;

// ==================== HOOKS DE CONSULTA - VEHÍCULOS ====================

export const useVehiculos = (params?: PaginatedVehiculoQueryDto) => {
  return useQuery<Vehiculo[] | PaginatedVehiculoResponse>({
    queryKey: params ? [...VEHICULOS_KEY, params] : VEHICULOS_KEY,
    queryFn: () => {
      if (params && (params.page || params.limit || params.search || params.status || params.type)) {
        return vehiculoService.getAllPaginated(params);
      }
      return vehiculoService.getAll();
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};

export const useVehiculosWithDeleted = () => {
  return useQuery<Vehiculo[]>({
    queryKey: [...VEHICULOS_KEY, 'with-deleted'],
    queryFn: () => vehiculoService.getAllWithDeleted(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useVehiculo = (id?: string) => {
  return useQuery<Vehiculo>({
    queryKey: [...VEHICULOS_KEY, id],
    queryFn: () => vehiculoService.getOne(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useExistsByPlaca = (placa?: string) => {
  return useQuery<ExistsResponse>({
    queryKey: ['vehiculos', 'placa', placa],
    queryFn: () => vehiculoService.existsByPlaca(placa as string),
    enabled: !!placa && placa.length >= 3,
    staleTime: 0, // No cachear para siempre validar en tiempo real
  });
};

// ==================== HOOKS DE MUTACIÓN - VEHÍCULOS ====================

export const useAddVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehiculo, Error, CreateVehiculoDto>({
    mutationFn: vehiculoService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
    },
  });
};

export const useUpdateVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehiculo, Error, { id: string; data: EditVehiculoDto }>({
    mutationFn: ({ id, data }) => vehiculoService.edit(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
      qc.invalidateQueries({ queryKey: [...VEHICULOS_KEY, variables.id] });
    },
  });
};

export const useDeleteVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<DeleteResponse, Error, string>({
    mutationFn: (id: string) => vehiculoService.softDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
    },
  });
};

export const useRestoreVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehiculo, Error, string>({
    mutationFn: (id: string) => vehiculoService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
    },
  });
};

export const useUpdateEstadoVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehiculo, Error, { id: string; data: UpdateEstadoDto }>({
    mutationFn: ({ id, data }) => vehiculoService.updateEstado(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
      qc.invalidateQueries({ queryKey: [...VEHICULOS_KEY, variables.id] });
    },
  });
};

export const useDarDeBajaVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehiculo, Error, { id: string; motivo: string }>({
    mutationFn: ({ id, motivo }) => vehiculoService.darDeBaja(id, motivo),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
      qc.invalidateQueries({ queryKey: [...VEHICULOS_KEY, variables.id] });
    },
  });
};

// ==================== HOOKS DE CONSULTA - MANTENIMIENTOS ====================

export const useHistorialVehiculo = (id?: string) => {
  return useQuery<Mantenimiento[]>({
    queryKey: id ? HISTORIAL_KEY(id) : ['vehiculos', 'historial', 'disabled'],
    queryFn: () => vehiculoService.obtenerHistorial(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useProximoMantenimiento = (id?: string) => {
  return useQuery<Mantenimiento | null>({
    queryKey: id ? PROXIMO_MANTENIMIENTO_KEY(id) : ['vehiculos', 'proximo', 'disabled'],
    queryFn: () => vehiculoService.obtenerProximoMantenimiento(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useMantenimientosPendientes = () => {
  return useQuery<Mantenimiento[]>({
    queryKey: MANTENIMIENTOS_PENDIENTES_KEY,
    queryFn: () => vehiculoService.obtenerMantenimientosPendientes(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useMantenimientosDelDia = () => {
  return useQuery<Mantenimiento[]>({
    queryKey: MANTENIMIENTOS_DEL_DIA_KEY,
    queryFn: () => vehiculoService.obtenerMantenimientosDelDia(),
    staleTime: 1000 * 60 * 2, // 2 minutos (más fresco)
  });
};

export const useTodosMantenimientos = () => {
  return useQuery<Mantenimiento[]>({
    queryKey: TODOS_MANTENIMIENTOS_KEY,
    queryFn: () => vehiculoService.obtenerTodosMantenimientos(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

// ==================== HOOKS DE MUTACIÓN - MANTENIMIENTOS ====================

export const useProgramarMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<Mantenimiento, Error, { vehiculoId: string; data: ProgramarMantenimientoDto }>({
    mutationFn: ({ vehiculoId, data }) => vehiculoService.programarMantenimiento(vehiculoId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
      qc.invalidateQueries({ queryKey: HISTORIAL_KEY(variables.vehiculoId) });
      qc.invalidateQueries({ queryKey: PROXIMO_MANTENIMIENTO_KEY(variables.vehiculoId) });
      qc.invalidateQueries({ queryKey: MANTENIMIENTOS_PENDIENTES_KEY });
      qc.invalidateQueries({ queryKey: TODOS_MANTENIMIENTOS_KEY });
    },
  });
};

export const useRegistrarMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<Mantenimiento, Error, { vehiculoId: string; data: RegistrarMantenimientoDto }>({
    mutationFn: ({ vehiculoId, data }) => vehiculoService.registrarMantenimiento(vehiculoId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
      qc.invalidateQueries({ queryKey: HISTORIAL_KEY(variables.vehiculoId) });
      qc.invalidateQueries({ queryKey: TODOS_MANTENIMIENTOS_KEY });
      // Invalida reportes de costos porque se agregó uno completado
      qc.invalidateQueries({ queryKey: ['reportes'] });
    },
  });
};

export const useCompletarMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<Mantenimiento, Error, { mantenimientoId: string; data: CompletarMantenimientoDto; vehiculoId?: string }>({
    mutationFn: ({ mantenimientoId, data }) => vehiculoService.completarMantenimiento(mantenimientoId, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
      qc.invalidateQueries({ queryKey: MANTENIMIENTOS_PENDIENTES_KEY });
      qc.invalidateQueries({ queryKey: MANTENIMIENTOS_DEL_DIA_KEY });
      qc.invalidateQueries({ queryKey: TODOS_MANTENIMIENTOS_KEY });
      if (variables.vehiculoId) {
        qc.invalidateQueries({ queryKey: HISTORIAL_KEY(variables.vehiculoId) });
        qc.invalidateQueries({ queryKey: PROXIMO_MANTENIMIENTO_KEY(variables.vehiculoId) });
      }
      // Invalida reportes de costos
      qc.invalidateQueries({ queryKey: ['reportes'] });
    },
  });
};

export const useCambiarEstadoMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<Mantenimiento, Error, { mantenimientoId: string; estado: EstadoMantenimiento; vehiculoId?: string }>({
    mutationFn: ({ mantenimientoId, estado }) => vehiculoService.cambiarEstadoMantenimiento(mantenimientoId, estado),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: MANTENIMIENTOS_PENDIENTES_KEY });
      qc.invalidateQueries({ queryKey: MANTENIMIENTOS_DEL_DIA_KEY });
      qc.invalidateQueries({ queryKey: TODOS_MANTENIMIENTOS_KEY });
      if (variables.vehiculoId) {
        qc.invalidateQueries({ queryKey: HISTORIAL_KEY(variables.vehiculoId) });
        qc.invalidateQueries({ queryKey: PROXIMO_MANTENIMIENTO_KEY(variables.vehiculoId) });
      }
    },
  });
};

export const useDeleteMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<DeleteResponse, Error, { id: string; vehiculoId?: string }>({
    mutationFn: ({ id }) => vehiculoService.softDeleteMantenimiento(id),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: TODOS_MANTENIMIENTOS_KEY });
      qc.invalidateQueries({ queryKey: MANTENIMIENTOS_PENDIENTES_KEY });
      if (variables.vehiculoId) {
        qc.invalidateQueries({ queryKey: HISTORIAL_KEY(variables.vehiculoId) });
      }
    },
  });
};

export const useRestoreMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<Mantenimiento, Error, { id: string; vehiculoId?: string }>({
    mutationFn: ({ id }) => vehiculoService.restoreMantenimiento(id),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: TODOS_MANTENIMIENTOS_KEY });
      if (variables.vehiculoId) {
        qc.invalidateQueries({ queryKey: HISTORIAL_KEY(variables.vehiculoId) });
      }
    },
  });
};

// ==================== HOOKS DE CONSULTA - REPORTES ====================

export const useCostosMensuales = (mes: number, anio: number) => {
  return useQuery<ReporteCostosMensuales>({
    queryKey: COSTOS_MENSUALES_KEY(mes, anio),
    queryFn: () => vehiculoService.obtenerCostosMensuales(mes, anio),
    enabled: !!mes && !!anio,
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
};

export const useCostosPorVehiculo = (vehiculoId?: string, mes?: number, anio?: number) => {
  return useQuery<ReporteCostosPorVehiculo>({
    queryKey: vehiculoId ? COSTOS_VEHICULO_KEY(vehiculoId, mes, anio) : ['reportes', 'disabled'],
    queryFn: () => vehiculoService.obtenerCostosPorVehiculo(vehiculoId as string, mes, anio),
    enabled: !!vehiculoId,
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
};