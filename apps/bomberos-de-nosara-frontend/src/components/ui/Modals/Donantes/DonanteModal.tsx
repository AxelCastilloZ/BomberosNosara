import { useEffect, useState } from "react";
import { Donante } from "../../../../types/donate";

interface ModalProps {
  donante: Donante | null;
  onClose: () => void;
}

export const DonanteModal = ({ donante, onClose }: ModalProps) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (donante) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [donante]);

  if (!donante) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm bg-black/30"
      role="dialog"
      aria-modal="true"
      aria-labelledby="donante-title"
      aria-describedby="donante-desc"
    >
      <div className="bg-white p-6 rounded-lg w-full max-w-md md:max-w-lg shadow-xl relative">
        {/* Cerrar */}
        <button
          onClick={() => { setExpanded(false); onClose(); }}
          className="absolute top-3 right-3 text-white bg-red-600 rounded-full p-1 text-3xl hover:bg-red-700"
          aria-label="Cerrar"
        >
          &times;
        </button>

        {/* Logo */}
        <img
          src={`${import.meta.env.VITE_API_URL}${donante.logo}`}
          alt={donante.nombre}
          className="h-40 mx-auto mb-4 object-contain"
        />

        {/* Título */}
        <h2 id="donante-title" className="text-xl font-bold text-center mb-3">
          {donante.nombre}
        </h2>

        {/* Descripción: clamp + fade + Ver más / Ver menos */}
        <div
          className={`relative ${expanded ? "max-h-[70vh] overflow-y-auto" : "max-h-40 overflow-hidden"} mb-4 px-1`}
        >
          <p
            id="donante-desc"
            className="text-gray-700 text-sm md:text-base whitespace-pre-line text-justify leading-relaxed break-all md:break-words"
            style={{
              overflowWrap: "anywhere",
              wordBreak: "break-word",
              hyphens: "auto",
            }}
          >
            {donante.descripcion}
          </p>

          {/* Fade cuando está colapsado */}
          {!expanded && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-sm text-red-600 hover:text-red-700 underline underline-offset-4"
            aria-expanded={expanded}
            aria-controls="donante-desc"
          >
            {expanded ? "Ver menos" : "Ver más"}
          </button>
        </div>

        {/* CTA */}
        <a
          href={donante.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
        >
          Visitar sitio del donante
        </a>
      </div>
    </div>
  );
};
