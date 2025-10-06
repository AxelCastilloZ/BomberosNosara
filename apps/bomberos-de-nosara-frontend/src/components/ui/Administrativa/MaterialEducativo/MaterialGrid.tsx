import { useState, useEffect } from 'react';

// Hooks
import { useMaterialEducativo } from '../../../../hooks/useMaterialEducativo';
import { useUploadMaterial } from '../../../../hooks/useUploadMaterial';
import { useUpdateMaterial } from '../../../../hooks/useUpdateMaterial';
import { useDeleteMaterial } from '../../../../hooks/useDeleteMaterial';

// Componentes UI
import MaterialCard from './MaterialCard';
import MaterialFilterBar from './MaterialFilterBar';
import UploadMaterialModal from './UploadMaterialModal';
import EditMaterialModal from './EditMaterialModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

// Servicios y utilidades
import { materialService } from '../../../../service/materialEducativoService';
import { downloadBlob, filenameFromContentDisposition } from '../../../../utils/downloadBlob';

// Tipos
import type { MaterialEducativo } from '../../../../interfaces/MaterialEducativo/material.interface';

// ✅ función para generar nombre de archivo si no viene del backend
function guessFilename(m: MaterialEducativo) {
  const ext = (m.url.split('.').pop() || 'bin').toLowerCase();
  const base = (m.titulo || 'material')
    .replace(/[^\w\s.-]+/g, '')
    .trim()
    .replace(/\s+/g, '_');
  return `${base || 'material'}.${ext}`;
}

export default function MaterialGrid() {
  // 🔹 Estados de filtros
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  // 🔹 Estados de paginación
  const [page, setPage] = useState(1);
  const limit = 9;

  const { data, isLoading, reload } = useMaterialEducativo(page, limit, search, filter);
  const materiales = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const [showUpload, setShowUpload] = useState(false);
  const [editing, setEditing] = useState<MaterialEducativo | null>(null);
  const [toDelete, setToDelete] = useState<MaterialEducativo | null>(null);

  // ✅ notificaciones tipo toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const { upload } = useUploadMaterial(async () => {
    setToast({ type: 'success', msg: '✅ Material subido con éxito.' });
    reload();
  });

  const { update, updateWithFile, isUpdating } = useUpdateMaterial(async () => {
    setEditing(null);
    setToast({ type: 'success', msg: '✅ Material actualizado con éxito.' });
    reload();
  });

  const { remove, isDeleting } = useDeleteMaterial(async () => {
    setToDelete(null);
    setToast({ type: 'success', msg: '✅ Material eliminado con éxito.' });
    reload();
  });

  if (isLoading) {
    return <p className="text-gray-700 text-center py-6">Cargando materiales...</p>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      {/* ✅ Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded shadow-lg text-white flex items-center justify-between gap-4 z-50 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
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

      {/* Barra de filtros */}
      <MaterialFilterBar
        onSearch={(term) => {
          setSearch(term);
          setPage(1);
        }}
        onFilter={(tipo) => {
          setFilter(tipo);
          setPage(1);
        }}
        onUploadClick={() => setShowUpload(true)}
      />

      <UploadMaterialModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSubmit={async (data) => {
          try {
            await upload(data);
          } catch (e: any) {
            setToast({ type: 'error', msg: e?.message || '❌ Error al subir el material.' });
          }
        }}
      />

      {/* Grid */}
      {materiales.length === 0 ? (
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
                onDownload={async () => {
                  try {
                    const res = await materialService.download(material.id);
                    const cd = res.headers?.['content-disposition'] as string | undefined;
                    const filename =
                      filenameFromContentDisposition(cd) || guessFilename(material);
                    downloadBlob(res.data, filename);
                    setToast({ type: 'success', msg: '✅ Descarga realizada con éxito.' });
                  } catch (e: any) {
                    setToast({ type: 'error', msg: e?.message || '❌ Error al descargar el material.' });
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
      <EditMaterialModal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        material={editing}
        onSubmit={async (id, data) => {
          try {
            await update(id, data);
          } catch (e: any) {
            setToast({ type: 'error', msg: e?.message || '❌ Error al actualizar el material.' });
          }
        }}
        onSubmitWithFile={async (id, data) => {
          try {
            await updateWithFile(id, data);
          } catch (e: any) {
            setToast({ type: 'error', msg: e?.message || '❌ Error al actualizar el material.' });
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
            setToast({ type: 'error', msg: e?.message || '❌ Error al eliminar el material.' });
          }
        }}
        isSubmitting={isDeleting}
      />
    </div>
  );
}
