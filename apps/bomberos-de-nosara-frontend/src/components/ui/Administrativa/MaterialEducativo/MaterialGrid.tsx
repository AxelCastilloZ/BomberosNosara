import { useState, useMemo, useEffect } from 'react';

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
    .replace(/[^\w\s.-]+/g, '') // quita caracteres raros
    .trim()
    .replace(/\s+/g, '_'); // reemplaza espacios por _
  return `${base || 'material'}.${ext}`;
}

export default function MaterialGrid() {
  const { materiales, isLoading, reload } = useMaterialEducativo();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const [editing, setEditing] = useState<MaterialEducativo | null>(null);
  const [toDelete, setToDelete] = useState<MaterialEducativo | null>(null);

  // ✅ estados para notificaciones tipo toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // ⏱️ autocierre de la notificación
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

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return materiales.filter((m: MaterialEducativo) => {
      const hitsText =
        m.titulo.toLowerCase().includes(term) ||
        m.descripcion.toLowerCase().includes(term);
      const hitsType = filter === '' || m.tipo === filter;
      return hitsText && hitsType;
    });
  }, [materiales, search, filter]);

  if (isLoading)
    return <p className="text-gray-700 text-center py-6">Cargando materiales...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      {/* ✅ Notificación tipo toast */}
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
        onSearch={setSearch}
        onFilter={setFilter}
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

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        {filtered.map((material: MaterialEducativo) => (
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
