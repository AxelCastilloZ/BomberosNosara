// hooks/useMaterialEducativo.ts
import { useEffect, useState } from 'react';
import { materialService } from '../service/materialEducativoService';
import { MaterialEducativo } from '../interfaces/MaterialEducativo/material.interface';

interface MaterialResponse {
  data: MaterialEducativo[];
  total: number;
}

export const useMaterialEducativo = (
  page: number,
  limit: number,
  search: string,
  filter: string,
  area: string
) => {
  const [data, setData] = useState<MaterialResponse>({ data: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // ✅ El hook ahora busca exclusivamente por título
      const res = await materialService.getAll(page, limit, search, filter, area);
      setData(res);
    } catch (error) {
      console.error('Error al obtener materiales:', error);
      setData({ data: [], total: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, search, filter, area]);

  return { data, isLoading, reload: fetchData };
};
