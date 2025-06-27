import { Donante } from "../../../types/donate";

interface Props {
  donante: Donante;
  onClick: () => void;
}

export const DonanteCard = ({ donante, onClick }: Props) => {
  return (
    <div
      className="text-center p-4 rounded-xl bg-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
    >
      <a href={donante.url} target="_blank" rel="noopener noreferrer">
        <img
          src={donante.logo}
          alt={donante.nombre}
          className="h-50 w-auto object-contain mx-auto transition-transform duration-300 hover:scale-105"
        />
      </a>

      <h3 className="mt-3 text-lg font-medium text-gray-800">{donante.nombre}</h3>

      <button
        onClick={onClick}
        className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg shadow hover:bg-red-700 active:scale-95 transition-all duration-300 ease-in-out"
      >
        Leer más
      </button>
    </div>
  );
};
