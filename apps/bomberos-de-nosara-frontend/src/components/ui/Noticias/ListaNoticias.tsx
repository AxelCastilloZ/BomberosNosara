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
        ${direccion === 'izquierda' ? 'left-2' : 'right-2'}
        bg-white rounded-full p-2
        hover:bg-red-100
      `}
    >
      {direccion === 'izquierda' ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
    </button>
  );
};

export const ListaNoticias = () => {
  // Mostrar solo las últimas 5 noticias en el carrusel
  const limit = 5;
  const { data, isLoading, error } = useNoticias(1, limit);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin h-12 w-12 border-4 border-red-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>No se pudieron cargar las noticias</p>
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
      <button className="w-3 h-3 rounded-full bg-gray-300 hover:bg-red-500 mt-4" />
    )
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <Slider {...configuracionCarrusel}>
        {data?.data.map((noticia) => (
          <div key={noticia.id} className="px-2">
            <NoticiaCard noticia={noticia} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

