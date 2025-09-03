import { useState } from 'react';
import { useDonantes } from '../service/donorService';
import { DonantesGrid } from '../components/ui/Donante/DonantesGrid';
import { DonanteModal } from '../components/ui/Modals/Donantes/DonanteModal';
import { Donante } from '../types/donate';

export default function DonantesPage() {
  const { data: paginatedData, isLoading, isError } = useDonantes();
  const [selected, setSelected] = useState<Donante | null>(null);
  const donantes = paginatedData?.data || [];

  if (isLoading) {
    return <div className="text-center p-20">Cargando donantes...</div>;
  }

  if (isError) {
    return <div className="text-center p-20 text-red-600">Error cargando donantes</div>;
  }

  return (
    <>
      <DonantesGrid donantes={donantes} onLeerMas={(donante) => setSelected(donante)} />
      <DonanteModal donante={selected} onClose={() => setSelected(null)} />
    </>
  );
}
