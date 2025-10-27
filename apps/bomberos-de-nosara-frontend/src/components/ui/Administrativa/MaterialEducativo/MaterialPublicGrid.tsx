import { useState, useEffect, useMemo } from "react";
import { useMaterialEducativo } from "../../../../hooks/useMaterialEducativo";
import MaterialPublicCard from "./MaterialPublicCard";
import PreviewMaterialModal from "./PreviewMaterialModal";
import { materialService } from "../../../../service/materialEducativoService";
import { downloadBlob, filenameFromContentDisposition } from "../../../../utils/downloadBlob";
import type { MaterialEducativo } from "../../../../interfaces/MaterialEducativo/material.interface";

export default function MaterialPublicGrid() {
  // 🔹 Estados para búsqueda con debounce
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [area, setArea] = useState("");
  const [page, setPage] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialEducativo | null>(null);
  const limit = 9;

  // ⏱️ Debounce para búsqueda
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // 🧠 Hook de materiales desde el backend
  const { data, isLoading } = useMaterialEducativo(page, limit, debouncedSearch, "", area);
  const materiales: MaterialEducativo[] = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  // 🔍 Filtro local por título (extra por fluidez)
  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    return materiales.filter((m) => {
      const hitsTitle = m.titulo.toLowerCase().includes(term);
      const hitsArea = area === "" || m.area === area;
      return hitsTitle && hitsArea;
    });
  }, [materiales, debouncedSearch, area]);

  // 🧱 UI
  return (
        <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
        Material Educativo
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Recursos disponibles para formación y capacitación de voluntarios y personal bomberil.
      </p>

      {/* 🔍 Barra de búsqueda y filtro por área */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6 items-center justify-center">
        {/* Buscar solo por título */}
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Buscar material por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
            />
          </svg>
        </div>

        {/* 🧭 Filtro por área */}
        <select
          className="border rounded p-2"
          value={area}
          onChange={(e) => {
            setArea(e.target.value);
            setPage(1);
          }}
        >
            <option value="">Todas las áreas</option>
            <option value="Incendios Forestales">Incendios Forestales</option>
            <option value="Incendios Industriales">Incendios Industriales</option>
            <option value="Rescates">Rescates Verticales </option>
            <option value="Rescate">Rescates Acuáticos </option>
            <option value="Primeros Auxilios">Primeros Auxilios</option>
            <option value="Reubicación de Animales">Reubicación de Animales</option>
        </select>
      </div>

      {/* 🧱 Grid de materiales */}
      {isLoading ? (
        <p className="text-gray-700 text-center py-6">Cargando materiales...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-600 mt-8">
          No se encontraron materiales con los filtros seleccionados.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((material) => (
            <MaterialPublicCard
              key={material.id}
              material={material}
              onView={() => setSelectedMaterial(material)}
              onDownload={async () => {
                try {
                  const res = await materialService.download(material.id);
                  const cd = res.headers?.["content-disposition"] as string | undefined;
                  const filename =
                    filenameFromContentDisposition(cd) ||
                    `${material.titulo || "archivo"}.pdf`;
                  downloadBlob(res.data, filename);
                } catch (err) {
                  console.error("Error al descargar el material:", err);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* 👁️ Modal de vista previa */}
      <PreviewMaterialModal
        isOpen={!!selectedMaterial}
        material={selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
        onDownload={async (m) => {
          try {
            const res = await materialService.download(m.id);
            const cd = res.headers?.["content-disposition"] as string | undefined;

            let filename: string;
            if (cd) {
              filename = filenameFromContentDisposition(cd) || m.titulo;
            } else {
              const ext = (m.url.split(".").pop() || "").toLowerCase();
              filename = `${m.titulo || "archivo"}.${ext || "bin"}`;
            }

            downloadBlob(res.data, filename);
          } catch (error) {
            console.error("Error al descargar el archivo:", error);
          }
        }}
      />

      {/* 📑 Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12 mb-12">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-2 py-1">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
