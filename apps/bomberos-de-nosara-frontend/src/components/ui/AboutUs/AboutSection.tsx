import React, { useState } from "react";
import { Flame, Users, Medal } from "lucide-react"; // Íconos
import { heroText } from "../../../data/aboutData";

export default function AboutSection() {
  const cards = [
    {
      id: 1,
      title: "Nuestro Origen",
      icon: <Flame className="w-6 h-6 text-red-800" />,
      short:
        "Hace sólo una década, la atención de un grave incendio en Nosara requería esperar que el departamento regional de Bomberos viajara más de una hora...",
      full: `Hace sólo una década, la atención de un grave incendio en Nosara requería esperar que el departamento regional de Bomberos viajara más de una hora en carreteras en mal estado. A pesar de los mejores esfuerzos, su hora de llegada a menudo es demasiado tarde.`,
    },
    {
      id: 2,
      title: "Nuestro Compromiso",
      icon: <Users className="w-6 h-6 text-red-800" />,
      short:
        "Una década después de su formación, estos voluntarios han salvado innumerables hogares, vidas y medios de sustento...",
      full: `Una década después de su formación, estos voluntarios han salvado innumerables hogares, vidas y medios de sustento y se han convertido en un recurso comunitario indispensable y muy utilizado.`,
    },
    {
      id: 3,
      title: "Nuestra Preparación",
      icon: <Medal className="w-6 h-6 text-red-800" />,
      short:
        "Aunque han recibido capacitaciones de alto nivel, estos hombres y mujeres, muchos de los cuales tienen familias propias...",
      full: `Aunque han recibido capacitaciones de alto nivel, estos hombres y mujeres, muchos de los cuales tienen trabajos a tiempo completo y/o familias, no son profesionales. Al principio, los gastos como equipo de protección, herramientas, transporte, suministros y mucho más, salieron de su propio bolsillo. A medida que aumentaba el volumen de llamadas, este modelo de financiación se volvió insostenible.`,
    },
  ];

  const [expanded, setExpanded] = useState<number | null>(null);

  const toggleCard = (id: number) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <section
      id="about-us"
      className="w-full bg-white py-16 px-6 font-[Poppins] text-gray-800"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* ---- Texto e información ---- */}
        <div className="w-full md:w-1/2 space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-semibold text-red-800 mb-4">
              Sobre Nosotros
            </h2>
            <p className="text-lg md:text-xl text-gray-700 font-light">
              {heroText}
            </p>
          </div>

          {/* ---- Cards ---- */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 relative"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-50 rounded-xl">{card.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {card.title}
                  </h3>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  {expanded === card.id ? card.full : card.short}
                </p>

                <button
                  onClick={() => toggleCard(card.id)}
                  className="text-red-800 font-medium text-sm hover:underline flex items-center gap-1"
                >
                  {expanded === card.id ? "Ver menos" : "Ver más"}
                  <span
                    className={`transform transition-transform duration-300 ${
                      expanded === card.id ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {/* Línea decorativa lateral */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-700 to-red-400 rounded-l-xl opacity-80"></div>
              </div>
            ))}
          </div>
        </div>

        {/* ---- Imagen ---- */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-lg">
            <img
              src="https://png.pngtree.com/thumb_back/fh260/background/20241210/pngtree-firefighters-in-action-with-water-hose-and-rescue-operations-image_16745921.jpg"
              alt="Bomberos Nosara"
              className="object-cover w-full h-[450px]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
