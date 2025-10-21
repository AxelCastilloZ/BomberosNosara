import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { MaterialEducativo } from "../../../../interfaces/MaterialEducativo/material.interface";
import {
  FaFilePdf,
  FaVideo,
  FaBookOpen,
  FaImage,
  FaPen,
  FaTrash,
  FaDownload,
  FaEye,
  FaEllipsisH,
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";

const iconMap: Record<MaterialEducativo["tipo"], ReactNode> = {
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
  onPreview,
}: {
  material: MaterialEducativo;
  onEdit?: (m: MaterialEducativo) => void;
  onDelete?: (m: MaterialEducativo) => void;
  onDownload?: (m: MaterialEducativo) => void;
  onPreview?: (m: MaterialEducativo) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Formatear fecha y hora (fecha corta CR)
  const formattedDateTime = material.createdAt
    ? new Date(material.createdAt).toLocaleString("es-CR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "";

  // 🧩 Obtener el nombre del usuario desde la relación
  // El backend ya incluye createdByUser en la respuesta
  const uploaderName = material.createdByUser
    ? `${material.createdByUser.nombre || ""} ${material.createdByUser.apellido || ""}`.trim() ||
      material.createdByUser.username ||
      material.createdByUser.email
    : "Usuario desconocido";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col justify-between relative">
      {/* Tipo, título y descripción */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          {iconMap[material.tipo]}
          <span className="font-semibold text-gray-700">{material.tipo}</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
          {material.titulo}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2">
          {material.descripcion}
        </p>

        {/* 📅 Fecha y 👤 Usuario */}
        <div className="mt-3 text-xs text-gray-500 space-y-0.5">
          {material.createdAt && (
            <div className="flex items-center gap-1">
              <FaCalendarAlt className="text-gray-400" />
              <span>Subido el {formattedDateTime}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <FaUser className="text-gray-400" />
            <span>por {uploaderName}</span>
          </div>
        </div>
      </div>

      {/* Botones y menú */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => onPreview?.(material)}
          className="flex items-center justify-center gap-2 text-gray-700 font-semibold border border-gray-300 rounded-md px-4 py-[6px] hover:bg-gray-50 hover:text-black transition w-full"
        >
          <FaEye size={14} />
          Ver
        </button>

        <div className="relative ml-2" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
          >
            <FaEllipsisH size={15} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10 animate-fadeIn">
              <button
                onClick={() => {
                  onDownload?.(material);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaDownload className="text-gray-500" /> Descargar
              </button>

              {onEdit && (
                <button
                  onClick={() => {
                    onEdit(material);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <FaPen className="text-amber-500" /> Editar
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => {
                    onDelete(material);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <FaTrash /> Eliminar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}