import { Noticia } from '../../../types/news';
import { FaCalendarAlt } from 'react-icons/fa';

type Props = {
  noticia: Noticia;
};

export const NoticiaCard = ({ noticia }: Props) => {
  return (
    <div className="relative bg-white rounded-lg overflow-hidden shadow-lg">

      <div className="relative h-[500px]">

        <img
          src={noticia.url}
          alt={noticia.titulo}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6">

          <div className="flex items-center text-white mb-4">
            <FaCalendarAlt className="text-red-500 mr-2" />
            <span>{noticia.fecha}</span>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-3 hover:text-red-500 transition-colors">
            {noticia.titulo}
          </h2>
          
          <p className="text-white/90 mb-4 line-clamp-2">
            {noticia.descripcion}
          </p>
          
          <button className="bg-red-600 text-white px-6 py-2 rounded-full 
            hover:bg-red-700 transition-colors">
            Leer más
          </button>
        </div>
      </div>
    </div>
  );
};



