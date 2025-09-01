import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Noticia } from '../types/news';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/noticias`;

//GET 
export const useNoticias = (page = 1, limit = 10, search?: string, fechaDesde?: string, fechaHasta?: string) => {
  return useQuery({
    queryKey: ['noticias', page, limit, search, fechaDesde, fechaHasta],
    queryFn: async (): Promise<{ data: Noticia[]; total: number; page: number; limit: number }> => {
      const params: any = { page, limit
    };

if (search) params.search = search;
      if (fechaDesde) params.fechaDesde = fechaDesde;
      if (fechaHasta) params.fechaHasta = fechaHasta;

    const res = await axios.get(API_URL, { params });
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

//POST 
export const useAddNoticia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newNoticia: Omit<Noticia, 'id'>) => {
      await axios.post(API_URL, newNoticia);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['noticias'] }),
  });
};

//PUT
export const useUpdateNoticia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ noticia, id }: { noticia: Omit<Noticia, 'id'>; id: number }) => {
      await axios.put(`${API_URL}/${id}`, noticia);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['noticias'] }),
  });
};

export const useDeleteNoticia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`${API_URL}/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['noticias'] }),
  });
};

