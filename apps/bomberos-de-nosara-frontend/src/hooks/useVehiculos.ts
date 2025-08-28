// hooks/useVehiculos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiculoService } from '../service/vehiculoService';
import type {
  Vehicle,
  MantenimientoData,
  MantenimientoProgramadoData,
  ReposicionData,
} from '../interfaces/Vehiculos/vehicle';

const VEHICULOS_KEY = ['vehiculos'] as const;

// Obtener todos los vehículos
export const useVehiculos = () => {
  return useQuery<Vehicle[]>({
    queryKey: VEHICULOS_KEY,
    queryFn: vehiculoService.getAll,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};

// Agregar vehículo
export const useAddVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehicle, Error, Omit<Vehicle, 'id'>>({
    mutationFn: vehiculoService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICULOS_KEY }),
  });
};

// Actualizar vehículo (parcial)
export const useUpdateVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehicle, Error, Partial<Vehicle> & { id: string }>({
    mutationFn: vehiculoService.update,
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICULOS_KEY }),
  });
};

// Cambiar estado actual
export const useActualizarEstadoVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehicle, Error, { id: string; estadoActual: Vehicle['estadoActual'] }>({
    mutationFn: ({ id, estadoActual }) => vehiculoService.updateEstado(id, estadoActual),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICULOS_KEY }),
  });
};

// Dar de baja
export const useDarDeBajaVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehicle, Error, { id: string; motivo: string }>({
    mutationFn: ({ id, motivo }) => vehiculoService.darDeBaja(id, motivo),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICULOS_KEY }),
  });
};

// Solicitar reposición
export const useRegistrarReposicionVehiculo = () => {
  const qc = useQueryClient();
  return useMutation<Vehicle, Error, { id: string; data: ReposicionData }>({
    mutationFn: ({ id, data }) => vehiculoService.registrarReposicion(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICULOS_KEY }),
  });
};

// Registrar mantenimiento (historial)
export const useRegistrarMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<any, Error, { id: string; data: MantenimientoData }>({
    mutationFn: ({ id, data }) => vehiculoService.registrarMantenimiento(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICULOS_KEY }),
  });
};

// Programar mantenimiento
export const useProgramarMantenimiento = () => {
  const qc = useQueryClient();
  return useMutation<any, Error, { id: string; data: MantenimientoProgramadoData }>({
    mutationFn: ({ id, data }) => vehiculoService.programarMantenimiento(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICULOS_KEY }),
  });
};
