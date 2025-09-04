// src/hooks/useEquiposBomberiles.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { equipoBomberilService } from '../service/equipoBomberilService';
import type {
  EquipoBomberil,
  EquipoMantenimiento,
  EquipoMantenimientoProgramado,
} from '../interfaces/EquipoBomberil/equipoBomberil';
import type { CatalogoEquipo } from '../interfaces/EquipoBomberil/catalogoEquipo';

/** Claves de cache */
export const EQUIPOS_KEY = ['equipos-bomberiles'] as const;
export const CATALOGOS_KEY = ['catalogo-equipo'] as const;
const HISTORIAL_KEY = (id: string) => ['equipos-bomberiles', id, 'historial'] as const;

/** Payload correcto para crear equipo (el backend requiere catalogoId) */
export type CreateEquipoBomberilInput = {
  catalogoId: string;
  fechaAdquisicion: string; // ISO yyyy-mm-dd
  estadoInicial: 'nuevo' | 'usado';
  estadoActual: 'disponible' | 'en mantenimiento' | 'dado de baja';
  numeroSerie?: string;
  fotoUrl?: string;
  cantidad: number;
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

/** Historial de mantenimientos realizados de un equipo */
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

export const useActualizarEstadoActual = () => {
  const qc = useQueryClient();
  return useMutation<EquipoBomberil, Error, { id: string; estadoActual: EquipoBomberil['estadoActual'] }>(
    {
      mutationFn: ({ id, estadoActual }) => equipoBomberilService.updateEstado(id, estadoActual),
      onSuccess: () => qc.invalidateQueries({ queryKey: EQUIPOS_KEY }),
    }
  );
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

/** Mantenimientos (realizados, sin kilometraje) */
export const useRegistrarMantenimientoEquipo = () => {
  const qc = useQueryClient();
  return useMutation<any, Error, { id: string; data: EquipoMantenimiento }>({
    mutationFn: ({ id, data }) => equipoBomberilService.registrarMantenimiento(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: EQUIPOS_KEY });
      qc.invalidateQueries({ queryKey: HISTORIAL_KEY(vars.id) });
    },
  });
};

/** Mantenimientos programados (próximos) */
export const useProgramarMantenimientoEquipo = () => {
  const qc = useQueryClient();
  return useMutation<any, Error, { id: string; data: EquipoMantenimientoProgramado }>({
    mutationFn: ({ id, data }) => equipoBomberilService.programarMantenimiento(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: EQUIPOS_KEY });
      qc.invalidateQueries({ queryKey: HISTORIAL_KEY(vars.id) });
    },
  });
};

/* ========================
 *  Resumen para dashboard
 * ======================*/
export type ResumenPorCatalogo = {
  catalogoId: string;
  nombre: string;
  tipo: CatalogoEquipo['tipo'];
  total: number;
  disponibles: number;
  mantenimiento: number;
  bajas: number;
};

export const useResumenEquipos = () => {
  const { data: equipos = [], isLoading, isError } = useEquiposBomberiles();

  const resumen: ResumenPorCatalogo[] = (equipos || []).reduce((acc, eq) => {
    const key = eq.catalogo?.id;
    if (!key) return acc;

    let row = acc.find((r) => r.catalogoId === key);
    if (!row) {
      row = {
        catalogoId: key,
        nombre: eq.catalogo!.nombre,
        tipo: eq.catalogo!.tipo,
        total: 0,
        disponibles: 0,
        mantenimiento: 0,
        bajas: 0,
      };
      acc.push(row);
    }

    row.total += eq.cantidad;
    if (eq.estadoActual === 'dado de baja') row.bajas += eq.cantidad;
    else if (eq.estadoActual === 'en mantenimiento') row.mantenimiento += eq.cantidad;
    else row.disponibles += eq.cantidad;

    return acc;
  }, [] as ResumenPorCatalogo[]);

  const totales = resumen.reduce(
    (a, r) => {
      a.total += r.total;
      a.disponibles += r.disponibles;
      a.mantenimiento += r.mantenimiento;
      a.bajas += r.bajas;
      return a;
    },
    { total: 0, disponibles: 0, mantenimiento: 0, bajas: 0 }
  );

  return { resumen, totales, isLoading, isError };
};
