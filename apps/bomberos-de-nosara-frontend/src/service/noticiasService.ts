import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Noticia } from '../types/news';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/noticias`;

//GET 
export const useNoticias = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['noticias', page, limit],
    queryFn: async (): Promise<{ data: Noticia[]; total: number; page: number; limit: number }> => {
      const res = await axios.get(API_URL, {
        params: { page, limit }
      });
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
    mutationFn: async (noticia: Noticia) => {
      await axios.put(`${API_URL}/${noticia.id}`, noticia);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['noticias'] }),
  });
};

//DELETE 
export const useDeleteNoticia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_URL}/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['noticias'] }),
  });
};

