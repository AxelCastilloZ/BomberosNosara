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
  FaClock,
  FaUpload,
  FaTimesCircle,
} from "react-icons/fa";

// Tipado seguro para los eventos de auditoría
interface EventItem {
  type: "Subido" | "Actualizado" | "Eliminado";
  date?: string | null;
  user: string | null;
}


const iconMap: Record<MaterialEducativo["tipo"], ReactNode> = {
  PDF: <FaFilePdf className="text-red-500" />,
  Video: <FaVideo className="text-blue-500" />,
  Documento: <FaBookOpen className="text-green-500" />,
  Imagen: <FaImage className="text-purple-500" />,
};

// 🔹 Tiempo relativo
const timeAgo = (dateString?: string | null) => {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "hace menos de un minuto";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days > 1 ? "s" : ""}`;
};

// 🔹 Mostrar nombre del usuario
const getDisplayName = (user?: any): string | null => {
  if (!user) return null;
  if (user.nombre || user.apellido)
    return `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim();
  if (user.username) return user.username;
  if (user.email) return user.email;
  return null;
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
  const [historyOpen, setHistoryOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const historyRef = useRef<HTMLDivElement | null>(null);

  // 🔸 Cerrar menú e historial si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (menuRef.current && !menuRef.current.contains(event.target as Node)) &&
        (historyRef.current && !historyRef.current.contains(event.target as Node))
      ) {
        setMenuOpen(false);
        setHistoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Conversión segura de fechas para evitar error TS2769
  const createdAt =
    material.createdAt !== undefined && material.createdAt !== null
      ? new Date(material.createdAt as string)
      : null;

  const updatedAt =
    material.updatedAt !== undefined && material.updatedAt !== null
      ? new Date(material.updatedAt as string)
      : null;

  const deletedAt =
    material.deletedAt !== undefined && material.deletedAt !== null
      ? new Date(material.deletedAt as string)
      : null;

  // ✅ Determinar si realmente hubo actualización
  const hasUpdated =
    createdAt !== null &&
    updatedAt !== null &&
    updatedAt.getTime() > createdAt.getTime();

  const latest: EventItem =
    deletedAt && material.deletedByUser
      ? {
          type: "Eliminado",
          date: material.deletedAt,
          user: getDisplayName(material.deletedByUser),
        }
      : hasUpdated && material.updatedByUser
      ? {
          type: "Actualizado",
          date: material.updatedAt,
          user: getDisplayName(material.updatedByUser),
        }
      : {
          type: "Subido",
          date: material.createdAt,
          user: getDisplayName(material.createdByUser),
        };

  // 🎨 Colores e iconos según tipo
  const colorMap: Record<EventItem["type"], string> = {
    Subido: "text-gray-600",
    Actualizado: "text-blue-600",
    Eliminado: "text-red-600",
  };

  const iconEventMap: Record<EventItem["type"], ReactNode> = {
    Subido: <FaUpload className="text-gray-500" />,
    Actualizado: <FaPen className="text-blue-500" />,
    Eliminado: <FaTimesCircle className="text-red-500" />,
  };

  const bgIconMap: Record<EventItem["type"], string> = {
    Subido: "bg-gray-100 text-gray-600",
    Actualizado: "bg-blue-100 text-blue-600",
    Eliminado: "bg-red-100 text-red-600",
  };

  const borderColor =
    latest.type === "Eliminado"
      ? "border-red-300 bg-red-50"
      : "border-gray-200 bg-white";

  // 🧩 Historial completo (solo acciones reales)
  const events: EventItem[] = [];

  // Siempre mostrar "Subido"
  if (createdAt) {
    events.push({
      type: "Subido",
      date: material.createdAt,
      user: getDisplayName(material.createdByUser),
    });
  }

  // Mostrar "Actualizado" solo si la fecha es posterior
  if (hasUpdated) {
    events.push({
      type: "Actualizado",
      date: material.updatedAt,
      user: getDisplayName(material.updatedByUser),
    });
  }

  // Mostrar "Eliminado" solo si existe fecha
  if (deletedAt) {
    events.push({
      type: "Eliminado",
      date: material.deletedAt,
      user: getDisplayName(material.deletedByUser),
    });
  }

  return (
    <div
      className={`relative rounded-xl border shadow-sm hover:shadow-md transition-all p-4 flex flex-col justify-between ${borderColor}`}
    >
      {/* Menú */}
      <div className="absolute top-3 right-3" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
        >
          <FaEllipsisH size={15} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-20">
            <button
              onClick={() => {
                onDownload?.(material);
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <FaDownload /> Descargar
            </button>

            {onEdit && (
              <button
                onClick={() => {
                  onEdit(material);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-amber-600 hover:bg-amber-50 flex items-center gap-2"
              >
                <FaPen /> Editar
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

      {/* Tipo */}
      <div className="flex items-center gap-2 mb-2">
        {iconMap[material.tipo]}
        <span className="font-semibold text-gray-700">{material.tipo}</span>
      </div>

      {/* Título y descripción */}
      <h3 className="text-lg font-bold text-gray-900 truncate">
        {material.titulo}
      </h3>
      <p className="text-sm text-gray-600 line-clamp-2">
        {material.descripcion}
      </p>

      {/* Última acción */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <div className="flex flex-col">
          <div className={`flex items-center gap-1 ${colorMap[latest.type]}`}>
            {iconEventMap[latest.type]}
            <span>
              {latest.type} por{" "}
              <strong>{latest.user || "(sin nombre)"}</strong>
            </span>
          </div>
          <span className="text-gray-400 ml-5">{timeAgo(latest.date)}</span>
        </div>

        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className={`flex items-center gap-1 text-black bg-gray-50 rounded-md px-2 py-[2px] hover:bg-gray-100 transition ${
            historyOpen ? "ring-1 ring-gray-300" : ""
          }`}
        >
          <FaClock className="text-gray-700" /> Historial
        </button>
      </div>

      {/* Historial */}
      {historyOpen && (
        <div
          ref={historyRef}
          className="absolute top-[72%] left-0 right-0 bg-white border rounded-md shadow-lg p-4 text-sm z-20 animate-slideFadeIn"
        >
          <p className="font-semibold text-gray-900 mb-3">
            Historial de actividad
          </p>

          <div className="space-y-3">
            {events.map((e, idx) => (
              <div key={`${e.type}-${idx}`} className="flex items-start gap-3">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${bgIconMap[e.type]}`}
                >
                  {iconEventMap[e.type]}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">{e.type}</span>
                  <span className="text-gray-600 text-[13px]">
                    por{" "}
                    <span
                      className={`${
                        e.type === "Subido"
                          ? "text-gray-600"
                          : e.type === "Actualizado"
                          ? "text-blue-600"
                          : "text-red-600"
                      } hover:underline cursor-pointer`}
                    >
                      {e.user || "(sin nombre)"}
                    </span>
                  </span>
                  <span className="text-gray-400 text-[12px]">
                    {timeAgo(e.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón Ver */}
      <div className="mt-4">
        <button
          onClick={() => onPreview?.(material)}
          className={`flex items-center justify-center gap-2 font-semibold rounded-md px-4 py-[6px] transition w-full
            ${
              latest.type === "Eliminado"
                ? "text-red-600 border border-red-300 hover:bg-red-50"
                : "text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-black"
            }
          `}
        >
          <FaEye size={14} />
          Ver
        </button>
      </div>
    </div>
  );
}
