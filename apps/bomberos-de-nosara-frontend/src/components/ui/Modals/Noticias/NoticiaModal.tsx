import { Noticia } from '../../../../types/news';
import { FaCalendarAlt, FaTimes } from 'react-icons/fa';

interface Props {
  noticia: Noticia;
  isOpen: boolean;
  onClose: () => void;
}

export const NoticiaModal = ({ noticia, isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Encabezado */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-red-600">{noticia.titulo}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600">
            <FaTimes size={24} />
          </button>
        </div>
        
        {/* Contenido */}
        <div className="p-6">
          {noticia.url && (
            <img 
              src={noticia.url} 
              alt={noticia.titulo} 
              className="w-full h-64 object-cover rounded mb-4"
            />
          )}
          
          <div className="flex items-center text-gray-600 mb-4">
            <FaCalendarAlt className="mr-2" />
            <span>{noticia.fecha}</span>
          </div>
          
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">
            {noticia.descripcion}
          </p>
        </div>
      </div>
    </div>
  );
};
