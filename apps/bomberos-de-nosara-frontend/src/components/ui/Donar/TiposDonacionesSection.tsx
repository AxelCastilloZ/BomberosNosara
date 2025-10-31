import React, { useState } from 'react';
import { DonationCard } from './DonationCard';
import { ResourceDonationModal } from './ResourceDonationModal';
import { MonetaryDonationModal } from './MonetaryDonationModal';
import { DonationType } from './types';

export const TiposDonacionesSection = () => {
  const [openModal, setOpenModal] = useState<DonationType | null>(null);

  const resourceIcon = (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  const monetaryIcon = (
    <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <section className="bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-serif font-light text-center mb-16">
          Tipos de Donaciones
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <DonationCard
            type="recursos"
            title="Donación de Recursos"
            description="Contribuye con equipo, vehículos y recursos materiales para nuestras operaciones de emergencia."
            icon={resourceIcon}
            buttonText="Ver Más Información"
            onButtonClick={() => setOpenModal('recursos')}
          />

          <DonationCard
            type="monetaria"
            title="Donación Monetaria"
            description="La forma más directa y efectiva de apoyar nuestras operaciones de emergencia y salvar vidas."
            icon={monetaryIcon}
            buttonText="Donar Ahora"
            onButtonClick={() => setOpenModal('monetaria')}
            benefits={[
              'Organización 501(c)(3) Certificada',
              'Deducible de impuestos en EE. UU.',
              'Seguro y rápido',
              'Impacto inmediato en la comunidad',
            ]}
            highlighted
          />
        </div>

        <ResourceDonationModal
          isOpen={openModal === 'recursos'}
          onClose={() => setOpenModal(null)}
        />

        <MonetaryDonationModal
          isOpen={openModal === 'monetaria'}
          onClose={() => setOpenModal(null)}
        />
      </div>
    </section>
  );
};