import { NoticiaCard } from "./NoticiaCard";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNoticias } from "../../../hooks/useNoticias";
import type { Noticia } from "../../../types/news";

const FlechaCarrusel = ({
  direccion,
  onClick,
}: {
  direccion: "izquierda" | "derecha";
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`hidden md:block absolute top-1/2 -translate-y-1/2 z-10 
      ${direccion === "izquierda" ? "left-2 lg:left-4" : "right-2 lg:right-4"} 
      px-3 py-3 bg-red-800 backdrop-blur-sm border border-white/30 text-white 
      font-medium rounded-full hover:bg-red-700 transition shadow-lg duration-300`}
  >
    {direccion === "izquierda" ? (
      <FaChevronLeft size={18} className="lg:w-6 lg:h-6" />
    ) : (
      <FaChevronRight size={18} className="lg:w-6 lg:h-6" />
    )}
  </button>
);

export const ListaNoticias = () => {
  const limit = 5;
  const { data, isLoading, error } = useNoticias(1, limit);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-72">
        <div className="animate-spin h-10 w-10 border-4 border-red-800 rounded-full border-t-transparent" />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-800 p-6 font-[Poppins]">
        <p className="text-base sm:text-lg">No se pudieron cargar las noticias</p>
      </div>
    );

  const configuracionCarrusel = {
    dots: true,
    infinite: (data?.data?.length ?? 0) > 1,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    prevArrow: <FlechaCarrusel direccion="izquierda" />,
    nextArrow: <FlechaCarrusel direccion="derecha" />,
    customPaging: () => (
      <button className="w-3 h-3 rounded-full bg-gray-300 hover:bg-red-800 mt-4 transition-colors duration-200" />
    ),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 font-[Poppins]">
      <Slider {...configuracionCarrusel}>
        {data?.data.map((noticia: Noticia) => (
          <div key={noticia.id} className="px-2 sm:px-4">
            <NoticiaCard noticia={noticia} />
          </div>
        ))}
      </Slider>
    </div>
  );
};
