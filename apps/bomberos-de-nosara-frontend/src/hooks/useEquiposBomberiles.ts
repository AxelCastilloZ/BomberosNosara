// src/hooks/useEquiposBomberiles.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipoBomberilService } from '../service/equipoBomberilService';
import type { EquipoBomberil } from '../interfaces/EquipoBomberil/equipoBomberil';
import type {  CatalogoEquipo } from '../interfaces/EquipoBomberil/catalogoEquipo';
import type {  ReposicionData } from '../interfaces/EquipoBomberil/reposicionData';
import { use } from 'react';
import { number } from 'framer-motion';

export const useEquiposBomberiles = () => {
  return useQuery({
    queryKey: ['equipos-bomberiles'],
    queryFn: equipoBomberilService.getAll,
    staleTime: 1000 * 60 * 10,
  });
};

export const useCatalogos = () => {
  return useQuery<CatalogoEquipo[]>({
    queryKey: ['catalogo-equipo'],
    queryFn: equipoBomberilService.getCatalogos,
    staleTime: 1000 * 60 * 30,
  });
};

export const useAddEquipoBomberil = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: equipoBomberilService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipos-bomberiles'] }),
  });
};

export const useUpdateEquipoBomberil = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: equipoBomberilService.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipos-bomberiles'] }),
  });
};

export const useActualizarEstadoActual = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estadoActual }: { id: string; estadoActual: EquipoBomberil['estadoActual'] }) =>
      equipoBomberilService.updateEstado(id, estadoActual),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipos-bomberiles'] }),
  });
};

export const useDeleteEquipoBomberil = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: equipoBomberilService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipos-bomberiles'] }),
  });
};

export const useAddCatalogoEquipo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: equipoBomberilService.addCatalogo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalogo-equipo'] }),
  });
};

export const useDarDeBaja = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cantidad }: { id: string; cantidad: number }) =>
      equipoBomberilService.darDeBaja(id, cantidad),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipos-bomberiles'] }),
  });
};

export const useRegistrarReposicion = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReposicionData }) =>
      equipoBomberilService.registrarReposicion(id, data),
  });
};


