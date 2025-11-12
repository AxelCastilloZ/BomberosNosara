"use client";

import { Card } from "../card";
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
import Img3 from "../../../images/Img3.jpeg";

export default function OurWorkSection() {
  const services = [
    { icon: Flame, title: "Extinción de Incendios", description: "Incendios forestales, estructurales, basura, eléctricos" },
    { icon: Heart, title: "Emergencia / Primera Respuesta", description: "Atención médica de emergencia y primeros auxilios" },
    { icon: Waves, title: "Guardavidas y Seguridad en la Playa", description: "Vigilancia y rescate en zonas costeras" },
    { icon: CircleAlert, title: "Emergencias Costeras", description: "Respuesta rápida a emergencias en el mar y playa" },
    { icon: Triangle, title: "Inundaciones, Terremotos y Eventos Naturales", description: "Respuesta a desastres naturales y catástrofes" },
    { icon: Car, title: "Accidentes Vehiculares", description: "Rescate y atención en accidentes de tránsito" },
  ];

  const additionalServices = [
    { icon: PawPrint, title: "Rescate de Animales Salvajes", description: "Reubicación segura de fauna silvestre" },
    { icon: GraduationCap, title: "Programas Educativos", description: "Capacitación y prevención en la comunidad" },
    { icon: Users, title: "Servicio Comunitario", description: "Apoyo y asistencia a la comunidad de Nosara" },
  ];

  return (
    <section className="relative w-full overflow-hidden font-[Poppins]">
      {/* Imagen de fondo más oscura */}
      <div
        className="absolute inset-0 z-0 opacity-600" // 🔥 leve opacidad general
        style={{
          backgroundImage: `url(${Img3})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Capa más oscura para contraste */}
        <div className="absolute inset-0 bg-black/75" /> {/* antes era /50 */}
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 py-10 md:py-14">
        <div className="container mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
          {/* Título */}
          <div className="text-center space-y-1">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              Nuestro Trabajo
            </h2>
            <p className="text-base md:text-lg text-white/95 font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
              Comprometidos con la seguridad y bienestar de nuestra comunidad
            </p>
          </div>

          {/* Cuadrícula 1 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Card
                key={index}
                className="relative min-h-[180px] bg-white/15 backdrop-blur-md border border-white/20 p-4 shadow-lg transition-all hover:bg-white/25 hover:scale-[1.02] hover:shadow-2xl flex flex-col items-center justify-center text-center space-y-2"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full 
                  bg-red-800 text-white font-medium hover:bg-red-700 
                  transition shadow-md"
                >
                  <service.icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="text-sm md:text-base font-bold text-white tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  {service.title}
                </h3>
                <p className="text-xs md:text-sm text-white/95 leading-snug font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] max-w-[240px]">
                  {service.description}
                </p>
              </Card>
            ))}
          </div>

          {/* Cuadrícula 2 */}
          <div className="grid gap-4 md:grid-cols-3">
            {additionalServices.map((service, index) => (
              <Card
                key={index}
                className="relative min-h-[180px] bg-white/15 backdrop-blur-md border border-white/20 p-4 shadow-lg transition-all hover:bg-white/25 hover:scale-[1.02] hover:shadow-2xl flex flex-col items-center justify-center text-center space-y-2"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full 
                  bg-red-800 text-white font-medium hover:bg-red-700 
                  transition shadow-md"
                >
                  <service.icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="text-sm md:text-base font-bold text-white tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                  {service.title}
                </h3>
                <p className="text-xs md:text-sm text-white/95 leading-snug font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] max-w-[240px]">
                  {service.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
