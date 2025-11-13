import { useTranslation } from "react-i18next";
import { Donante } from "../../../types/donate";

interface Props {
  donante: Donante;
  onClick: () => void;
}

export const DonanteCard = ({ donante, onClick }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="text-center p-4 rounded-2xl bg-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
      <a href={donante.url} target="_blank" rel="noopener noreferrer">
        <div className="block h-32 w-full flex items-center justify-center">
          <img
            src={`${import.meta.env.VITE_API_URL}${donante.logo}`}
            alt={donante.nombre}
            className="h-full w-auto object-contain mx-auto transition-transform duration-300 hover:scale-105"
          />
        </div>
      </a>

      <h3 className="mt-3 text-lg font-semibold text-gray-800">{donante.nombre}</h3>

      <button
        onClick={onClick}
        className="mt-4 px-5 py-2 bg-red-800 backdrop-blur-sm border border-white/30 text-white font-medium rounded-3xl hover:bg-red-700 transition shadow-md hover:shadow-lg"
      >
        {t('donors.readMore')}
      </button>
    </div>
  );
};