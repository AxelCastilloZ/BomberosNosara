// src/hooks/useEquiposBomberiles.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { equipoBomberilService } from '../service/equipoBomberilService';
import type {
  EquipoBomberil,
  EquipoMantenimiento,
  EquipoMantenimientoProgramado,
  NuevoMantenimientoDTO,
} from '../interfaces/EquipoBomberil/equipoBomberil';
import type { CatalogoEquipo } from '../interfaces/EquipoBomberil/catalogoEquipo';

/** Claves de cache */
export const EQUIPOS_KEY = ['equipos-bomberiles'] as const;
export const CATALOGOS_KEY = ['catalogo-equipo'] as const;
const HISTORIAL_KEY = (id: string) => ['equipos-bomberiles', id, 'historial'] as const;

/** Payload correcto para crear equipo */
export type CreateEquipoBomberilInput = {
  catalogoId: string;
  fechaAdquisicion: string;
  estadoInicial: 'nuevo' | 'usado';
  estadoActual: 'disponible' | 'en mantenimiento' | 'dado de baja';
  numeroSerie?: string;
  fotoUrl?: string;
  cantidad: number;
};

/** Payload para actualizar estado (total o parcial) */
export type UpdateEstadoPayload = {
  id: string;
  estadoActual: EquipoBomberil['estadoActual'];
  /** Si se envía, aplica el cambio solo a esa cantidad; si no, aplica al grupo completo */
  cantidadAfectada?: number;
};

/* ========================
 *  Queries
 * ======================*/
export const useEquiposBomberiles = () => {
  return useQuery<EquipoBomberil[]>({
    queryKey: EQUIPOS_KEY,
    queryFn: equipoBomberilService.getAll,
    staleTime: 1000 * 60 * 10,
  });
};

export const useCatalogos = () => {
  return useQuery<CatalogoEquipo[]>({
    queryKey: CATALOGOS_KEY,
    queryFn: equipoBomberilService.getCatalogos,
    staleTime: 1000 * 60 * 30,
  });
};

export const useHistorialEquipo = (id?: string) => {
  return useQuery<EquipoMantenimiento[]>({
    queryKey: id ? HISTORIAL_KEY(id) : ['equipos-bomberiles', 'historial', 'disabled'],
    queryFn: () => equipoBomberilService.getHistorial(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/* ========================
 *  Mutations
 * ======================*/
export const useAddCatalogoEquipo = () => {
  const qc = useQueryClient();
  return useMutation<CatalogoEquipo, Error, { nombre: string; tipo: CatalogoEquipo['tipo'] }>({
    mutationFn: equipoBomberilService.addCatalogo,
    onSuccess: () => qc.invalidateQueries({ queryKey: CATALOGOS_KEY }),
  });
};

export const useAddEquipoBomberil = () => {
  const qc = useQueryClient();
  return useMutation<EquipoBomberil, Error, CreateEquipoBomberilInput>({
    mutationFn: equipoBomberilService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: EQUIPOS_KEY }),
  });
};

export const useUpdateEquipoBomberil = () => {
  const qc = useQueryClient();
  return useMutation<EquipoBomberil, Error, Partial<EquipoBomberil> & { id: string }>({
    mutationFn: equipoBomberilService.update,
    onSuccess: () => qc.invalidateQueries({ queryKey: EQUIPOS_KEY }),
  });
};

/**
 * Cambiar estado del lote (total) o mover parcialmente sin duplicar filas.
 * - Total -> PATCH /:id/estado-actual  (optimistic + replace)
 * - Parcial -> PATCH /:id/estado-parcial (refetch porque cambian 2 filas)
 */
export const useActualizarEstadoActual = () => {
  const qc = useQueryClient();

  return useMutation<
    EquipoBomberil,                           // result
    Error,                                    // error
    UpdateEstadoPayload,                      // variables
    { prev?: EquipoBomberil[] }               // context
  >({
    mutationFn: async ({ id, estadoActual, cantidadAfectada }) => {
      if (typeof cantidadAfectada === 'number') {
        // PARCIAL: mueve parte del lote
        return equipoBomberilService.patchEstadoParcial(id, {
          estadoActual,
          cantidad: cantidadAfectada,
        });
      }
      // TOTAL: cambia todo el lote
      return equipoBomberilService.patchEstadoActual(id, estadoActual);
    },

    // Optimistic SOLO para cambio total
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: EQUIPOS_KEY });

      const prev = qc.getQueryData<EquipoBomberil[]>(EQUIPOS_KEY);

      if (typeof vars.cantidadAfectada !== 'number' && prev) {
        const next = prev.map((e) =>
          String(e.id) === String(vars.id) ? { ...e, estadoActual: vars.estadoActual } : e
        );
        qc.setQueryData<EquipoBomberil[]>(EQUIPOS_KEY, next);
      }

      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData<EquipoBomberil[]>(EQUIPOS_KEY, ctx.prev);
    },

    onSuccess: (updated, vars) => {
      if (typeof vars.cantidadAfectada === 'number') {
        // PARCIAL: cambian origen y destino -> refetch para ver ambas filas al instante
        qc.invalidateQueries({ queryKey: EQUIPOS_KEY });
        return;
      }
      // TOTAL: reemplaza en cache (evita duplicados)
      qc.setQueryData<EquipoBomberil[]>(EQUIPOS_KEY, (prev = []) =>
        prev.map((e) => (String(e.id) === String(updated.id) ? updated : e))
      );
    },
  });
};

export const useDeleteEquipoBomberil = () => {
  const qc = useQueryClient();
  return useMutation<{ success: true }, Error, string>({
    mutationFn: equipoBomberilService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: EQUIPOS_KEY }),
  });
};

export const useDarDeBaja = () => {
  const qc = useQueryClient();
  return useMutation<EquipoBomberil, Error, { id: string; cantidad: number }>({
    mutationFn: ({ id, cantidad }) => equipoBomberilService.darDeBaja(id, cantidad),
    onSuccess: () => qc.invalidateQueries({ queryKey: EQUIPOS_KEY }),
  });
};

export const useRegistrarMantenimientoEquipo = () => {
  const qc = useQueryClient();
  return useMutation<
    EquipoMantenimiento,
    Error,
    { id: string; data: NuevoMantenimientoDTO }
  >({
    mutationFn: ({ id, data }) => equipoBomberilService.registrarMantenimiento(id, data),
    onSuccess: (_created, vars) => {
      qc.invalidateQueries({ queryKey: EQUIPOS_KEY });
      qc.invalidateQueries({ queryKey: HISTORIAL_KEY(vars.id) });
    },
  });
};

export const useProgramarMantenimientoEquipo = () => {
  const qc = useQueryClient();
  return useMutation<
    EquipoMantenimientoProgramado,
    Error,
    { id: string; data: EquipoMantenimientoProgramado }
  >({
    mutationFn: ({ id, data }) => equipoBomberilService.programarMantenimiento(id, data),
    onSuccess: (_created, vars) => {
      qc.invalidateQueries({ queryKey: EQUIPOS_KEY });
      qc.invalidateQueries({ queryKey: HISTORIAL_KEY(vars.id) });
    },
  });
};
