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
  filter: string
) => {
  const [data, setData] = useState<MaterialResponse>({ data: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await materialService.getAll(page, limit, search, filter);
      setData(res); // ✅ { data: [], total: number }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, search, filter]);

  return { data, isLoading, reload: fetchData };
};
