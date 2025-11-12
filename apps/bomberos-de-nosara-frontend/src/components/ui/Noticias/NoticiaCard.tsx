import { Noticia } from "../../../types/news";
import { FaCalendarAlt } from "react-icons/fa";
import { useState } from "react";

type Props = {
  noticia: Noticia;
};

export const NoticiaCard = ({ noticia }: Props) => {
  const [showFull, setShowFull] = useState(false);

  return (
    <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 font-[Poppins]">
      {/* Imagen */}
      <div className="relative h-[320px] sm:h-[420px] md:h-[480px] lg:h-[520px]">
        <img
          src={noticia.url}
          alt={noticia.titulo}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Contenido */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8">
          {/* Fecha */}
          <div className="flex items-center text-white mb-3">
            <FaCalendarAlt className="text-red-800 mr-2 text-sm sm:text-base" />
            <span className="text-xs sm:text-sm lg:text-base">{noticia.fecha}</span>
          </div>

          {/* Título */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight hover:text-red-800 transition-colors">
            {noticia.titulo}
          </h2>

          {/* Descripción */}
          <p
            className={`text-white/90 text-sm sm:text-base leading-relaxed transition-all duration-300 ${
              showFull ? "" : "line-clamp-2"
            }`}
          >
            {noticia.descripcion}
          </p>

          {/* Botón Leer más */}
          <button
            onClick={() => setShowFull(!showFull)}
            className="mt-4 px-4 py-1.5 bg-red-800 backdrop-blur-sm border border-white/30 
            text-white font-medium rounded-3xl hover:bg-red-700 transition text-xs sm:text-sm shadow-md"
          >
            {showFull ? "Ver menos" : "Leer más"}
          </button>
        </div>
      </div>
    </div>
  );
};
