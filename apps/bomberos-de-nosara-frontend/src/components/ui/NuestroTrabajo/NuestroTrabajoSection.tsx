"use client";

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
  const services = [
    {
      icon: Flame,
      title: "Combate de Incendios",
      description: "Incendios forestales, estructurales, basura, eléctricos",
    },
    {
      icon: Heart,
      title: "Atención Médica",
      description: "Atención médica de emergencia y primeros auxilios",
    },
    {
      icon: Waves,
      title: "Emergencias Costeras",
      description: "Respuesta rápida a emergencias en el mar y playa",
    },
    {
      icon: Triangle,
      title: "Desastres Naturales",
      description: "Respuesta a desastres naturales y catástrofes",
    },
    {
      icon: Car,
      title: "Accidentes Vehiculares",
      description: "Rescate y atención en accidentes de tránsito",
    },
    {
      icon: PawPrint,
      title: "Rescate de Animales Salvajes",
      description: "Reubicación segura de fauna silvestre",
    },
    {
      icon: GraduationCap,
      title: "Programas Educativos",
      description: "Capacitación y prevención en la comunidad",
    },
    {
      icon: Users,
      title: "Servicio Comunitario",
      description: "Apoyo y asistencia a la comunidad de Nosara",
    },
    {
      icon: CircleAlert,
      title: "Guardia Costera",
      description: "Vigilancia y rescate en zonas costeras",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden font-[Poppins] bg-gradient-to-b from-white via-[#E5E7EB] to-[#374151]">
      {/* Contenido principal */}
      <div className="relative z-10 py-16 md:py-20">
        <div className="container mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
          {/* Encabezado */}
          <div className="text-center space-y-3">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Nuestro Trabajo
            </h2>
            <p className="text-lg md:text-xl text-gray-700 font-medium max-w-3xl mx-auto">
              Comprometidos con la seguridad y bienestar de nuestra comunidad
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