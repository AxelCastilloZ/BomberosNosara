import { useEffect, useState } from 'react';
import { materialService } from '../service/materialEducativoService';
import { MaterialEducativo } from '../interfaces/MaterialEducativo/material.interface';

export const useMaterialEducativo = () => {
  const [materiales, setMateriales] = useState<MaterialEducativo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await materialService.getAll();
    setMateriales(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { materiales, isLoading, reload: fetchData };
};

