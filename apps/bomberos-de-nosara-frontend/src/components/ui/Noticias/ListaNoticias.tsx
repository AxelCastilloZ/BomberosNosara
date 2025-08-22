import { NoticiaCard } from './NoticiaCard';
import { useNoticias } from '../../../service/noticiasService';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const FlechaCarrusel = ({ direccion, onClick }: { direccion: 'izquierda' | 'derecha', onClick?: () => void }) => {
  return (
    <button
      onClick={onClick}
      className={`
        hidden md:block
        absolute top-1/2 -translate-y-1/2 z-10
        ${direccion === 'izquierda' ? 'left-2 lg:left-4' : 'right-2 lg:right-4'}
        text-white rounded-full p-2 lg:p-3
        hover:bg-red-100 hover:text-black
        transition-colors duration-200
      `}
    >
      {direccion === 'izquierda' ? <FaChevronLeft size={20} className="lg:w-6 lg:h-6" /> : <FaChevronRight size={20} className="lg:w-6 lg:h-6" />}
    </button>
  );
};

export const ListaNoticias = () => {
  // Mostrar solo las últimas 5 noticias en el carrusel
  const limit = 5;
  const { data, isLoading, error } = useNoticias(1, limit);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 sm:h-80 lg:h-96">
        <div className="animate-spin h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-4 border-red-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4 sm:p-6 lg:p-8">
        <p className="text-sm sm:text-base lg:text-lg">No se pudieron cargar las noticias</p>
      </div>
    );
  }

  const configuracionCarrusel = {
    dots: true,
    infinite: (data?.data?.length ?? 0) > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    prevArrow: <FlechaCarrusel direccion="izquierda" />, 
    nextArrow: <FlechaCarrusel direccion="derecha" />, 
    customPaging: () => (
      <button className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-300 hover:bg-red-500 mt-2 sm:mt-4 transition-colors duration-200" />
    )
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-6">
      <Slider {...configuracionCarrusel}>
        {data?.data.map((noticia) => (
          <div key={noticia.id} className="px-1 sm:px-2 lg:px-3">
            <NoticiaCard noticia={noticia} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

