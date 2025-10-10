import { useState, useEffect, useCallback } from "react";
import { useMaterialEducativo } from "../../../../hooks/useMaterialEducativo";
import { useUploadMaterial } from "../../../../hooks/useUploadMaterial";
import { useUpdateMaterial } from "../../../../hooks/useUpdateMaterial";
import { useDeleteMaterial } from "../../../../hooks/useDeleteMaterial";
import MaterialCard from "./MaterialCard";
import UploadMaterialModal from "./UploadMaterialModal";
import EditMaterialModal from "./EditMaterialModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import PreviewMaterialModal from "./PreviewMaterialModal";
import { materialService } from "../../../../service/materialEducativoService";
import { downloadBlob, filenameFromContentDisposition } from "../../../../utils/downloadBlob";
import type { MaterialEducativo } from "../../../../interfaces/MaterialEducativo/material.interface";

function guessFilename(m: MaterialEducativo) {
  const ext = (m.url.split(".").pop() || "bin").toLowerCase();
  const base = (m.titulo || "material")
    .replace(/[^\w\s.-]+/g, "")
    .trim()
    .replace(/\s+/g, "_");
  return `${base || "material"}.${ext}`;
}

export default function MaterialGrid() {
  // 🔹 Filtros
  const [area, setArea] = useState("");

  // 🔹 Búsqueda con debounce
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // 🔹 Paginación
  const [page, setPage] = useState(1);
  const limit = 9;

  const { data, isLoading, reload } = useMaterialEducativo(page, limit, debouncedSearch, "", area);
  const materiales = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  // 🔹 Modales y estados
  const [showUpload, setShowUpload] = useState(false);
  const [editing, setEditing] = useState<MaterialEducativo | null>(null);
  const [toDelete, setToDelete] = useState<MaterialEducativo | null>(null);
  const [previewing, setPreviewing] = useState<MaterialEducativo | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const { upload } = useUploadMaterial(async () => {
    setToast({ type: "success", msg: "✅ Material subido con éxito." });
    reload();
  });

  const { update, updateWithFile, isUpdating } = useUpdateMaterial(async () => {
    setEditing(null);
    setToast({ type: "success", msg: "✅ Material actualizado con éxito." });
    reload();
  });

  const { remove, isDeleting } = useDeleteMaterial(async () => {
    setToDelete(null);
    setToast({ type: "success", msg: "✅ Material eliminado con éxito." });
    reload();
  });

  // ✅ Funciones memorizadas
  const handleUploadClick = useCallback(() => setShowUpload(true), []);
  const handleFilterArea = useCallback((a: string) => { setArea(a); setPage(1); }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      {/* ✅ Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded shadow-lg text-white flex items-center justify-between gap-4 z-50 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          <span>{toast.msg}</span>
          <button
            onClick={() => setToast(null)}
            className="font-bold text-xl leading-none hover:opacity-75"
          >
            ×
          </button>
        </div>
      )}

      {/* Encabezado */}
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
        Gestión de Material Educativo
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Accede a recursos esenciales para la formación y capacitación de Bomberos de Nosara.
      </p>

      {/* 🔍 Barra de búsqueda y filtro */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
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

        <select
          className="border rounded p-2"
          value={area}
          onChange={(e) => handleFilterArea(e.target.value)}
        >
            <option value="">Todas las áreas</option>
            <option value="Incendios Forestales">Incendios Forestales</option>
            <option value="Incendios Industriales">Incendios Industriales</option>
            <option value="Rescates">Rescates Verticales </option>
            <option value="Rescate">Rescates Acuáticos </option>
            <option value="Primeros Auxilios">Primeros Auxilios</option>
            <option value="Reubicación de Animales">Reubicación de Animales</option>
        </select>

        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleUploadClick}
        >
          ➕ Subir Nuevo Material
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <p className="text-gray-700 text-center py-6">Cargando materiales...</p>
      ) : materiales.length === 0 ? (
        <p className="text-center text-gray-600 mt-8">No hay materiales disponibles.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            {materiales.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                onEdit={setEditing}
                onDelete={setToDelete}
                onPreview={setPreviewing}
                onDownload={async () => {
                  try {
                    const res = await materialService.download(material.id);
                    const cd = res.headers?.["content-disposition"] as string | undefined;
                    const filename =
                      filenameFromContentDisposition(cd) || guessFilename(material);
                    downloadBlob(res.data, filename);
                    setToast({ type: "success", msg: "✅ Descarga realizada con éxito." });
                  } catch (e: any) {
                    setToast({
                      type: "error",
                      msg: e?.message || "❌ Error al descargar el material.",
                    });
                  }
                }}
              />
            ))}
          </div>

          {/* Paginación */}
          <div className="flex justify-end gap-2 mt-12 mb-12">
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
        </>
      )}

      {/* Modales */}
      <UploadMaterialModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSubmit={async (data) => {
          try {
            await upload(data);
          } catch (e: any) {
            setToast({ type: "error", msg: e?.message || "❌ Error al subir el material." });
          }
        }}
      />

      <EditMaterialModal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        material={editing}
        onSubmit={async (id, data) => {
          try {
            await update(id, data);
          } catch (e: any) {
            setToast({ type: "error", msg: e?.message || "❌ Error al actualizar el material." });
          }
        }}
        onSubmitWithFile={async (id, data) => {
          try {
            await updateWithFile(id, data);
          } catch (e: any) {
            setToast({ type: "error", msg: e?.message || "❌ Error al actualizar el material." });
          }
        }}
        isSubmitting={isUpdating}
      />

      <ConfirmDeleteModal
        isOpen={!!toDelete}
        material={toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async (id: number) => {
          try {
            await remove(id);
          } catch (e: any) {
            setToast({ type: "error", msg: e?.message || "❌ Error al eliminar el material." });
          }
        }}
        isSubmitting={isDeleting}
      />

      <PreviewMaterialModal
        isOpen={!!previewing}
        material={previewing}
        onClose={() => setPreviewing(null)}
        onDownload={async (m) => {
          try {
            const res = await materialService.download(m.id);
            const cd = res.headers?.["content-disposition"] as string | undefined;
            const filename = filenameFromContentDisposition(cd) || guessFilename(m);
            downloadBlob(res.data, filename);
            setToast({ type: "success", msg: "✅ Descarga realizada con éxito." });
          } catch (e: any) {
            setToast({ type: "error", msg: e?.message || "❌ Error al descargar el material." });
          }
        }}
      />
    </div>
  );
}
