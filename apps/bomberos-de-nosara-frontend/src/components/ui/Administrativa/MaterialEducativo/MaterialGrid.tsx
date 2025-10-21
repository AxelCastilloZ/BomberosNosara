import { useState, useMemo } from 'react';

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

  const { upload } = useUploadMaterial(reload);
  const { update, updateWithFile, isUpdating } = useUpdateMaterial(() => {
    setEditing(null);
    reload();
  });
  const { remove, isDeleting } = useDeleteMaterial(() => {
    setToDelete(null);
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
        Gestión de Material Educativo
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Accede a recursos esenciales para la formación y capacitación de Bomberos de Nosara.
      </p>

      {/* Barra de filtros directamente sobre el fondo */}
      <MaterialFilterBar
        onSearch={setSearch}
        onFilter={setFilter}
        onUploadClick={() => setShowUpload(true)}
      />

      <UploadMaterialModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSubmit={upload}
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
              const res = await materialService.download(material.id);
              const cd = res.headers?.['content-disposition'] as string | undefined;
              const filename =
                filenameFromContentDisposition(cd) || guessFilename(material);
              downloadBlob(res.data, filename);
            }}
          />
        ))}
      </div>

      {/* Modales */}
      <EditMaterialModal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        material={editing}
        onSubmit={update}
        onSubmitWithFile={updateWithFile}
        isSubmitting={isUpdating}
      />
      <ConfirmDeleteModal
        isOpen={!!toDelete}
        material={toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={(id: number) => remove(id)}
        isSubmitting={isDeleting}
      />
    </div>
  );
}
