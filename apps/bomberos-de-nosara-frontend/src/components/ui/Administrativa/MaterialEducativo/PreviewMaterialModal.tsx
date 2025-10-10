import { useState } from "react";
import { FaTimes, FaDownload, FaSearchPlus, FaSearchMinus } from "react-icons/fa";
import { MaterialEducativo } from "../../../../interfaces/MaterialEducativo/material.interface";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  material?: MaterialEducativo | null;
  onDownload?: (m: MaterialEducativo) => void;
}

export default function PreviewMaterialModal({
  isOpen,
  onClose,
  material,
  onDownload,
}: Props) {
  if (!isOpen || !material) return null;

  const isPdf = material.tipo === "PDF";
  const isImage = material.tipo === "Imagen";
  const isVideo = material.tipo === "Video";
  const isDoc = material.tipo === "Documento";

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const fileUrl = material.url.startsWith("http")
    ? material.url
    : `${baseUrl}/${material.url.replace(/^\/+/, "")}`;

  // 🔍 Estado de zoom (solo imágenes)
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));
  const resetZoom = () => setZoom(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-11/12 md:w-3/4 lg:w-2/3 max-h-[92vh] overflow-hidden relative animate-fadeIn">
        {/* Encabezado */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
            Vista previa — {material.titulo}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Contenido dinámico */}
        <div className="p-4 bg-gray-50 flex justify-center items-center relative">
          {isPdf && (
            <iframe
              src={fileUrl}
              className="w-full h-[66vh] rounded"
              title={material.titulo}
            />
          )}

          {isImage && (
            <div className="relative w-full flex justify-center">
              <img
                src={fileUrl}
                alt={material.titulo}
                style={{
                  transform: `scale(${zoom})`,
                  transition: "transform 0.3s ease",
                }}
                className="max-h-[66vh] object-contain rounded-lg"
              />

              {/* 🔍 Controles de zoom */}
              <div className="absolute top-2 right-2 flex flex-col bg-white rounded-md shadow-md border">
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-gray-100 transition text-gray-700"
                  title="Acercar"
                >
                  <FaSearchPlus />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-gray-100 transition text-gray-700 border-t"
                  title="Alejar"
                >
                  <FaSearchMinus />
                </button>
                <button
                  onClick={resetZoom}
                  className="p-1 text-xs text-gray-600 hover:text-black border-t"
                  title="Restablecer zoom"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {isVideo && (
            <video
              src={fileUrl}
              controls
              className="max-h-[66vh] w-full rounded-lg"
            />
          )}

          {isDoc && (
            <iframe
              src={
                material.vistaPrevia
                  ? `${baseUrl}/${material.vistaPrevia.replace(/^\/+/, "")}`
                  : `https://docs.google.com/gview?url=${encodeURIComponent(
                      fileUrl
                    )}&embedded=true`
              }
              className="w-full h-[66vh] rounded"
              title={material.titulo}
            />
          )}
        </div>

        {/* Pie con botones */}
        <div className="p-4 border-t flex justify-end gap-4 bg-white">
          {(isImage || isPdf || isVideo) && (
            <button
              onClick={() => onDownload?.(material)}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold"
            >
              <FaDownload /> Descargar
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
