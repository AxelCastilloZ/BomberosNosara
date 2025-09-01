import { Noticia } from '../../../types/news';
import { FaCalendarAlt } from 'react-icons/fa';
import { useState } from 'react';

type Props = {
  noticia: Noticia;
};

export const NoticiaCard = ({ noticia }: Props) => {
  const [showFull, setShowFull] = useState(false);

  return (
    <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg">
      {/* Imagen */}
      <div className="relative h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px]">
        <img
          src={noticia.url}
          alt={noticia.titulo}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70" />
        
        {/* Contenido */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5 lg:p-6">
          {/* Fecha */}
          <div className="flex items-center text-white mb-2 sm:mb-3 lg:mb-4">
            <FaCalendarAlt className="text-red-500 mr-2 text-sm sm:text-base" />
            <span className="text-xs sm:text-sm lg:text-base">{noticia.fecha}</span>
          </div>
          
          {/* Título */}
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-2 sm:mb-3 lg:mb-4 hover:text-red-500 transition-colors leading-tight">
            {noticia.titulo}
          </h2>
          
          {/* Descripción con toggle */}
          <div className="mb-3 sm:mb-4 lg:mb-5">
            <p className={`text-white/90 leading-relaxed transition-all duration-300 ${
              showFull ? '' : 'line-clamp-2'
            } text-xs sm:text-sm md:text-base lg:text-lg`}>
              {noticia.descripcion}
            </p>
          </div>
          
          {/* Botón Leer más */}
          <button
            onClick={() => setShowFull(!showFull)}
            className="bg-red-600 text-white px-2 py-1 rounded-full hover:bg-red-700 transition-colors text-xs sm:text-sm lg:text-lg font-semibold"
          >
            {showFull ? 'Ver menos' : 'Leer más'}
          </button>
        </div>
      </div>
    </div>
  );
};