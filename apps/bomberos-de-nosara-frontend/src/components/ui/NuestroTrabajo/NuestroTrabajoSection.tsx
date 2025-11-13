"use client";

import { useTranslation } from "react-i18next";
import ServiceCard from "./ServiceCard";
import {
  Flame,
  Heart,
  Waves,
  CircleAlert,
  Triangle,
  Car,
  PawPrint,
  GraduationCap,
  Users,
} from "lucide-react";

export default function NuestroTrabajoSection() {
  const { t } = useTranslation();

  const services = [
    {
      icon: Flame,
      title: t('work.services.fires.title'),
      description: t('work.services.fires.description'),
    },
    {
      icon: Heart,
      title: t('work.services.medical.title'),
      description: t('work.services.medical.description'),
    },
    {
      icon: Waves,
      title: t('work.services.coastal.title'),
      description: t('work.services.coastal.description'),
    },
    {
      icon: Triangle,
      title: t('work.services.disasters.title'),
      description: t('work.services.disasters.description'),
    },
    {
      icon: Car,
      title: t('work.services.accidents.title'),
      description: t('work.services.accidents.description'),
    },
    {
      icon: PawPrint,
      title: t('work.services.wildlife.title'),
      description: t('work.services.wildlife.description'),
    },
    {
      icon: GraduationCap,
      title: t('work.services.education.title'),
      description: t('work.services.education.description'),
    },
    {
      icon: Users,
      title: t('work.services.community.title'),
      description: t('work.services.community.description'),
    },
    {
      icon: CircleAlert,
      title: t('work.services.lifeguard.title'),
      description: t('work.services.lifeguard.description'),
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-white via-[#E5E7EB] to-[#374151]">
      {/* Contenido principal */}
      <div className="relative z-10 py-16 md:py-20">
        <div className="container mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
          {/* Encabezado */}
          <div className="text-center space-y-3">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              {t('work.title')}
            </h2>
            <p className="text-lg md:text-xl text-gray-700 font-medium max-w-3xl mx-auto">
              {t('work.subtitle')}
            </p>
          </div>

          {/* Grid de servicios - 3 columnas */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                icon={service.icon}
                title={service.title}
                description={service.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}