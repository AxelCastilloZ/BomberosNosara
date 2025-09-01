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
  onDownload, // 👈 nuevo
}: {
  material: MaterialEducativo;
  onEdit?: (m: MaterialEducativo) => void;
  onDelete?: (m: MaterialEducativo) => void;
  onDownload?: (m: MaterialEducativo) => void;
}) {
  return (
    <div className="bg-white rounded-lg border shadow p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {iconMap[material.tipo]}
        <span className="font-semibold">{material.tipo}</span>
      </div>

      <h3 className="text-lg font-bold">{material.titulo}</h3>
      <p className="text-sm text-gray-600">{material.descripcion}</p>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {material.tipo === 'Video' ? (
            <Button className="bg-blue-600 hover:bg-blue-700">📺 Previsualizar</Button>
          ) : null}

          <Button
            className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
            onClick={() => onDownload?.(material)}
            title="Descargar"
            aria-label={`Descargar ${material.titulo}`}
          >
            <FaDownload /> Descargar
          </Button>
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
              onClick={() => onEdit(material)}
              title="Editar"
              aria-label={`Editar ${material.titulo}`}
            >
              <FaPen /> Editar
            </Button>
          )}
          {onDelete && (
            <Button
              className="bg-rose-600 hover:bg-rose-700 flex items-center gap-2"
              onClick={() => onDelete(material)}
              title="Eliminar"
              aria-label={`Eliminar ${material.titulo}`}
            >
              <FaTrash /> Eliminar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
