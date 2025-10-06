import type { ReactNode } from 'react';
import { MaterialEducativo } from '../../../../interfaces/MaterialEducativo/material.interface';
import { FaFilePdf, FaVideo, FaBookOpen, FaImage, FaPen, FaTrash, FaDownload } from 'react-icons/fa';

const Button = ({ children, className = '', ...props }: any) => (
  <button className={`px-4 py-2 rounded text-white font-semibold ${className}`} {...props}>
    {children}
  </button>
);

const iconMap: Record<MaterialEducativo['tipo'], ReactNode> = {
  PDF: <FaFilePdf className="text-red-600" />,
  Video: <FaVideo className="text-blue-500" />,
  Documento: <FaBookOpen className="text-green-500" />,
  Imagen: <FaImage className="text-purple-500" />,
};

export default function MaterialCard({
  material,
  onEdit,
  onDelete,
  onDownload,
}: {
  material: MaterialEducativo;
  onEdit?: (m: MaterialEducativo) => void;
  onDelete?: (m: MaterialEducativo) => void;
  onDownload?: (m: MaterialEducativo) => void;
}) {
  return (
    <div className="bg-white rounded-lg border shadow p-4 flex flex-col gap-3">
      {/* Tipo */}
      <div className="flex items-center gap-2">
        {iconMap[material.tipo]}
        <span className="font-semibold">{material.tipo}</span>
      </div>

      {/* Título y descripción */}
      <h3 className="text-lg font-bold truncate">{material.titulo}</h3>
      <p className="text-sm text-gray-600 line-clamp-2 break-words">
        {material.descripcion}
      </p>

      {/* Botones */}
      <div className="mt-auto flex flex-wrap gap-2">
        {/* Descargar */}
        <button
          className="flex-1 min-w-[120px] bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded flex items-center justify-center gap-2 font-semibold"
          onClick={() => onDownload?.(material)}
        >
          <FaDownload /> <span className="hidden sm:inline">Descargar</span>
        </button>

        {/* Editar */}
        {onEdit && (
          <button
            className="flex-1 min-w-[100px] bg-amber-400 hover:bg-amber-500 text-white px-3 py-2 rounded flex items-center justify-center gap-2 font-semibold"
            onClick={() => onEdit(material)}
          >
            <FaPen /> <span className="hidden sm:inline">Editar</span>
          </button>
        )}

        {/* Eliminar */}
        {onDelete && (
          <button
            className="w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded flex items-center justify-center"
            onClick={() => onDelete(material)}
            title="Eliminar"
          >
            <FaTrash />
          </button>
        )}
      </div>
    </div>
  );
}
