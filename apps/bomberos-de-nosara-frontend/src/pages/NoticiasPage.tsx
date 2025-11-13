import { useTranslation } from "react-i18next";
import { ListaNoticias } from "../components/ui/Noticias/ListaNoticias";

const NoticiasPage = () => {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-[#F9FAFB] py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado de la sección */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4">
            {t('news.title')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            {t('news.subtitle')}
          </p>
        </div>

        {/* Lista de noticias (carrusel) */}
        <ListaNoticias />
      </div>
    </main>
  );
};

export default NoticiasPage;