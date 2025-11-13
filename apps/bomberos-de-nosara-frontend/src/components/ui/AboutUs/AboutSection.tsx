"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import Img2 from "../../../images/Img2.jpeg";

export default function AboutSection() {
  const { t } = useTranslation();

  // Párrafos traducidos dinámicamente
  const paragraphs = [
    { id: 1, content: t('about.paragraph1') },
    { id: 2, content: t('about.paragraph2') },
    { id: 3, content: t('about.paragraph3') },
    { id: 4, content: t('about.paragraph4') },
  ];

  return (
    <section
      id="about-us"
      className="w-full bg-white py-12 md:py-16 px-6"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-8 md:gap-16">
        {/* ---- Columna Izquierda: Texto ---- */}
        <div className="w-full md:w-[45%] space-y-6">
          {/* Encabezado */}
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              {t('about.title')}
            </h2>
            <p className="text-lg text-gray-700 mt-3 leading-relaxed">
              {t('about.subtitle')}
            </p>
          </div>

          {/* Contenido completo - Todos los párrafos visibles */}
          <div className="text-gray-700 leading-relaxed space-y-4 text-base">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.id} className="leading-relaxed">
                {paragraph.content}
              </p>
            ))}
          </div>
        </div>

        {/* ---- Columna Derecha: Imagen ---- */}
        <div className="relative w-full md:w-[55%] flex justify-center items-start">
          <div className="relative w-full max-w-xl">
            {/* Imagen principal con efecto hover */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
              <img
                src={Img2}
                alt="Bomberos Voluntarios de Nosara"
                className="w-full h-[500px] md:h-[700px] object-cover object-center rounded-2xl transition-all duration-500"
              />
              
              {/* Overlay sutil en hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Efecto decorativo */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-800/10 rounded-full blur-2xl" />
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-red-800/5 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}