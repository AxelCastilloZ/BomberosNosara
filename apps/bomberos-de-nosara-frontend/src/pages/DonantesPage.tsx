import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDonantes } from '../service/donorService';
import { DonantesGrid } from '../components/ui/Donante/DonantesGrid';
import { DonanteModal } from '../components/ui/Modals/Donantes/DonanteModal';
import { Donante } from '../types/donate';

export default function DonantesPage() {
  const { t } = useTranslation();
  const { data: paginatedData, isLoading, isError } = useDonantes();
  const [selected, setSelected] = useState<Donante | null>(null);
  const donantes = paginatedData?.data || [];

  if (isLoading) {
    return <div className="text-center p-20">{t('donors.loading')}</div>;
  }

  if (isError) {
    return <div className="text-center p-20 text-red-600">{t('donors.error')}</div>;
  }

  return (
    <>
      <DonantesGrid donantes={donantes} onLeerMas={(donante) => setSelected(donante)} />
      <DonanteModal donante={selected} onClose={() => setSelected(null)} />
    </>
  );
}