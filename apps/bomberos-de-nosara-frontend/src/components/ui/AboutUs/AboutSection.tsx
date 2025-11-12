"use client";

import React, { useState, useRef } from "react";
import { Flame, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../button";
import { aboutParagraphs } from "../../../data/aboutData";
import Img2 from "../../../images/Img2.jpeg";

export default function AboutSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  };

  return (
    <section
      id="about-us"
      ref={sectionRef}
      className="w-full bg-white py-10 md:py-12 px-6 font-[Poppins]"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-8 md:gap-12">
        {/* ---- Columna Izquierda ---- */}
        <div className="w-full md:w-1/2 space-y-5">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Sobre Nosotros
            </h2>
            <p className="text-lg text-gray-700 mt-2 leading-relaxed">
              Los bomberos son esenciales para la seguridad de nuestras comunidades locales.
            </p>
          </div>

          {/* ---- Texto con expansión ---- */}
          <div className="text-gray-700 leading-relaxed space-y-3">
            {/* 🔹 Mostrar los 3 primeros párrafos visibles siempre */}
            {aboutParagraphs.slice(0, 3).map((p) => (
              <p key={p.id}>{p.content}</p>
            ))}

            {/* 🔹 Mostrar el resto al presionar “Ver Más” */}
            <div
              className={`overflow-hidden transition-all duration-700 ease-in-out ${
                isExpanded ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="space-y-3 mt-2">
                {aboutParagraphs.slice(3).map((p, i) => (
                  <p
                    key={p.id}
                    style={{ transitionDelay: `${i * 100}ms` }}
                    className="animate-in fade-in slide-in-from-top-2 duration-500"
                  >
                    {p.content}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* ---- Botón ---- */}
          <div className="pt-2">
            <Button
              onClick={handleToggle}
              variant="outline"
              className="group border-2 border-red-800/20 hover:border-red-800 hover:bg-red-800 text-red-800 hover:text-white font-semibold px-6 py-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <span className="mr-2">{isExpanded ? "Ver Menos" : "Ver Más"}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
              ) : (
                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              )}
            </Button>
          </div>
        </div>

        {/* ---- Columna Derecha (Imagen) ---- */}
        <div className="relative w-full md:w-1/2 flex justify-center items-start md:mt-[0.8rem]">
          <div className="absolute -top-5 right-8 z-20 animate-pulse">
          </div>

          <div className="relative w-full max-w-md mt-0">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
              <img
                src={Img2}
                alt="Bomberos Voluntarios de Nosara"
                className="w-full h-[600px] object-contain md:object-cover object-center rounded-2xl transition-all duration-500"
              />
            </div>

            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-red-800/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
