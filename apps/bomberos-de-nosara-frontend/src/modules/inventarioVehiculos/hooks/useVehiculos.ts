import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiculoService } from '../services/vehiculoService';
import type {
  Vehicle,
  MantenimientoData,
  MantenimientoProgramadoData,
  ReposicionData,
} from '../../../types/vehiculo.types';

const VEHICULOS_KEY = ['vehiculos'] as const;
const HISTORIAL_KEY = (id: string) => ['vehiculos', id, 'historial'] as const;

// ==================== TIPOS PARA PAGINACIÓN ====================

interface UseVehiculosParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}

interface PaginatedResponse {
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== HOOKS DE CONSULTA ====================

export const useVehiculos = (params?: UseVehiculosParams) => {
  return useQuery<Vehicle[] | PaginatedResponse>({
    queryKey: params ? [...VEHICULOS_KEY, params] : VEHICULOS_KEY,
    queryFn: () => {
      if (params) {
        return vehiculoService.getAllPaginated(params);
      }
      return vehiculoService.getAll();
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useHistorialVehiculo = (id?: string) => {
  return useQuery<any[]>({
    queryKey: id ? HISTORIAL_KEY(id) : ['vehiculos', 'historial', 'disabled'],
    queryFn: () => vehiculoService.getHistorial(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useExistsByPlaca = (placa?: string) => {
  return useQuery<{ exists: boolean }>({
    queryKey: ['vehiculos', 'placa', placa],
    queryFn: () => vehiculoService.existsByPlaca(placa as string),
    enabled: !!placa && placa.length >= 3,
    staleTime: 0, // No cachear para siempre validar en tiempo real
  });
};

// ==================== HOOKS DE MUTACIÓN - VEHÍCULOS ====================

export const useAddVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehicle, Error, Omit<Vehicle, 'id'>>({
    mutationFn: vehiculoService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICULOS_KEY }),
  });
};

export const useUpdateVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehicle, Error, Partial<Vehicle> & { id: string }>({
    mutationFn: vehiculoService.update,
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICULOS_KEY }),
  });
};

export const useActualizarEstadoVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehicle, Error, { id: string; estadoActual: Vehicle['estadoActual'] }>({
    mutationFn: ({ id, estadoActual }) => vehiculoService.updateEstado(id, estadoActual),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICULOS_KEY }),
  });
};

export const useDeleteVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id: string) => vehiculoService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICULOS_KEY }),
  });
};

export const useRestoreVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehicle, Error, string>({
    mutationFn: (id: string) => vehiculoService.restore(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICULOS_KEY }),
  });
};

export const useDarDeBajaVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehicle, Error, { id: string; motivo: string }>({
    mutationFn: ({ id, motivo }) => vehiculoService.darDeBaja(id, motivo),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICULOS_KEY }),
  });
};

// ==================== HOOKS DE MUTACIÓN - REPOSICIÓN ====================

export const useRegistrarReposicionVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehicle, Error, { id: string; data: ReposicionData }>({
    mutationFn: ({ id, data }) => vehiculoService.registrarReposicion(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICULOS_KEY }),
  });
};

// ==================== HOOKS DE MUTACIÓN - MANTENIMIENTOS ====================

export const useRegistrarMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<any, Error, { id: string; data: MantenimientoData }>({
    mutationFn: ({ id, data }) => vehiculoService.registrarMantenimiento(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
      qc.invalidateQueries({ queryKey: HISTORIAL_KEY(variables.id) });
    },
  });
};

export const useProgramarMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<Vehicle, Error, { id: string; data: MantenimientoProgramadoData }>({
    mutationFn: ({ id, data }) => vehiculoService.programarMantenimiento(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
      qc.invalidateQueries({ queryKey: HISTORIAL_KEY(variables.id) });
    },
  });
};

export const useCancelarMantenimientoProgramado = () => {
  const qc = useQueryClient();
  return useMutation<Vehicle, Error, string>({
    mutationFn: (id: string) => vehiculoService.cancelarMantenimientoProgramado(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
      qc.invalidateQueries({ queryKey: HISTORIAL_KEY(id) });
    },
  });
};

export const useDeleteMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<{ message: string }, Error, { id: string; vehiculoId?: string }>({
    mutationFn: ({ id }) => vehiculoService.deleteMantenimiento(id),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
      if (variables.vehiculoId) {
        qc.invalidateQueries({ queryKey: HISTORIAL_KEY(variables.vehiculoId) });
      }
    },
  });
};

export const useRestoreMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<any, Error, { id: string; vehiculoId?: string }>({
    mutationFn: ({ id }) => vehiculoService.restoreMantenimiento(id),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: VEHICULOS_KEY });
      if (variables.vehiculoId) {
        qc.invalidateQueries({ queryKey: HISTORIAL_KEY(variables.vehiculoId) });
      }
    },
  });
};