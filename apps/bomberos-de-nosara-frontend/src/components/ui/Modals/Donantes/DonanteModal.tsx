import { useEffect } from "react";
import { Donante } from "../../../../types/donate";

interface ModalProps {
  donante: Donante | null;
  onClose: () => void;
}

export const DonanteModal = ({ donante, onClose }: ModalProps) => {
  useEffect(() => {
    if (donante) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [donante]);

  if (!donante) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm bg-black/30">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white bg-red-600 rounded-full p-1 text-3xl hover:bg-red-700"
        >
          &times;
        </button>

        <img
          src={`${import.meta.env.VITE_API_URL}${donante.logo}`}
          alt={donante.nombre}
          className="h-40 mx-auto mb-4 object-contain"
        />

        <h2 className="text-xl font-bold text-center mb-2">{donante.nombre}</h2>

        <p className="text-gray-700 mb-4 whitespace-pre-line text-justify">{donante.descripcion}</p>

        <a
          href={donante.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
        >
          Visitar sitio del donante
        </a>
      </div>
    </div>
  );
};
