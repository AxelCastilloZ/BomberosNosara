import { FaFilePdf, FaVideo, FaBookOpen, FaImage, FaDownload, FaEye } from 'react-icons/fa';
import { MaterialEducativo } from '../../../../interfaces/MaterialEducativo/material.interface';

interface Props {
  material: MaterialEducativo;
  onDownload?: (m: MaterialEducativo) => void;
  onView?: (m: MaterialEducativo) => void;
}

const iconColors: Record<MaterialEducativo['tipo'], string> = {
  PDF: "bg-red-100 text-red-600",
  Video: "bg-purple-100 text-purple-600",
  Documento: "bg-green-100 text-green-600",
  Imagen: "bg-blue-100 text-blue-600",
};

const iconMap = {
  PDF: <FaFilePdf />,
  Video: <FaVideo />,
  Documento: <FaBookOpen />,
  Imagen: <FaImage />,
};

export default function MaterialPublicCard({ material, onDownload, onView }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      {/* Imagen o vista previa */}
      {material.vistaPrevia ? (
        <img
          src={material.vistaPrevia}
          alt={material.titulo}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-40 bg-gray-100 text-4xl">
          {iconMap[material.tipo]}
        </div>
      )}

      {/* Contenido */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className={`px-2 py-1 rounded ${iconColors[material.tipo]}`}>
            {iconMap[material.tipo]}
          </span>
          <span className="font-semibold">{material.tipo}</span>
        </div>

        <h3 className="text-lg font-bold">{material.titulo}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{material.descripcion}</p>

        <div className="flex justify-between items-center mt-3">
          <button
            onClick={() => onView?.(material)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <FaEye /> Ver
          </button>
          <button
            onClick={() => onDownload?.(material)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold"
          >
            <FaDownload /> Descargar
          </button>
        </div>
      </div>
    </div>
  );
}
