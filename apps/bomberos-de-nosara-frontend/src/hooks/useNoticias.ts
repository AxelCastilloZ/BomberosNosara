import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { noticiaService } from '../service/noticiasService';
import { Noticia } from '../types/news';

// Hook para obtener noticias con filtros
export const useNoticias = (
  page = 1,
  limit = 10,
  search?: string,
  fechaDesde?: string,
  fechaHasta?: string
) => {
  return useQuery({
    queryKey: ['noticias', page, limit, search, fechaDesde, fechaHasta],
    queryFn: () => noticiaService.getAll(page, limit, search, fechaDesde, fechaHasta),
    staleTime: 1000 * 60 * 10,
  });
};

// Hook para crear noticia
export const useAddNoticia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: noticiaService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['noticias'] }),
  });
};

// Hook para actualizar noticia
export const useUpdateNoticia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, noticia }: { id: number; noticia: Omit<Noticia, 'id'> }) =>
      noticiaService.update(id, noticia),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['noticias'] }),
  });
};

// Hook para eliminar noticia
export const useDeleteNoticia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: noticiaService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['noticias'] }),
  });
};