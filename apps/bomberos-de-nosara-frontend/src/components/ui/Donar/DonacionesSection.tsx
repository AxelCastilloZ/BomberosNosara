import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { DonationCard } from "./DonationCard";
import { ResourceDonationModal } from "./ResourceDonationModal";
import { MonetaryDonationModal } from "./MonetaryDonationModal";
import type { DonationType } from "./types";

export const DonacionesSection = () => {
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState<DonationType | null>(null);

  const resourceIcon = (
    <svg
      className="w-12 h-12"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );

  const monetaryIcon = (
    <svg
      className="w-14 h-14"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  return (
    <section className="bg-gradient-to-b from-[#111827] via-[#1F2937] to-[#111827] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section - Mensaje Emocional */}
        <div className="text-center pt-20 pb-16 sm:pt-28 sm:pb-20">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
            <span className="block">{t('donate.hero.save')}</span>
            <span className="block text-red-600">{t('donate.hero.lives')}</span>
            <span className="block text-gray-300">{t('donate.hero.withYourHelp')}</span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('donate.hero.description')}
          </p>
        </div>

        {/* Tipos de Donaciones - Cards */}
        <div className="pb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-white">
            {t('donate.sectionTitle')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <DonationCard
              type="recursos"
              title={t('donate.types.resources.title')}
              description={t('donate.types.resources.description')}
              icon={resourceIcon}
              buttonText={t('donate.types.resources.btnText')}
              onButtonClick={() => setOpenModal("recursos")}
            />

            <DonationCard
              type="monetaria"
              title={t('donate.types.monetary.title')}
              description={t('donate.types.monetary.description')}
              icon={monetaryIcon}
              buttonText={t('donate.types.monetary.btnText')}
              onButtonClick={() => setOpenModal("monetaria")}
              benefits={[
                t('donate.types.monetary.benefits.certified'),
                t('donate.types.monetary.benefits.taxDeductible'),
                t('donate.types.monetary.benefits.secure'),
                t('donate.types.monetary.benefits.immediate'),
              ]}
              highlighted
            />
          </div>
        </div>

        {/* Información 501(c)(3) - Nota al final */}
        <div className="text-center pb-24 sm:pb-32 border-t border-white/10 pt-16">
          <div className="max-w-4xl mx-auto">
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-8">
              {t('donate.info.paragraph1')}
            </p>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 sm:p-8 mb-8">
              <p className="text-gray-200 leading-relaxed">
                {t('donate.info.paragraph2')}{" "}
                <span className="font-semibold text-red-500">{t('donate.info.nonprofit')}</span>. 
                {" "}{t('donate.info.paragraph3')}
              </p>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-gray-400 mb-2">
                  {t('donate.info.costaRica')}
                </p>
                <a 
                  href="mailto:donaciones@bomberosdenosara.org"
                  className="text-red-500 hover:text-red-400 font-semibold transition-colors"
                >
                  donaciones@bomberosdenosara.org
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Separador visual rojo antes del footer */}
      <div className="h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>

      {/* Modals */}
      <ResourceDonationModal
        isOpen={openModal === "recursos"}
        onClose={() => setOpenModal(null)}
      />
      <MonetaryDonationModal
        isOpen={openModal === "monetaria"}
        onClose={() => setOpenModal(null)}
      />
    </section>
  );
};