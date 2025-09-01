import { useState, useMemo } from 'react';
import { useMaterialEducativo } from '../../../../hooks/useMaterialEducativo';
import MaterialCard from './MaterialCard';
import MaterialFilterBar from './MaterialFilterBar';
import UploadMaterialModal from './UploadMaterialModal';
import EditMaterialModal from './EditMaterialModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

import { useUploadMaterial } from '../../../../hooks/useUploadMaterial';
import { useUpdateMaterial } from '../../../../hooks/useUpdateMaterial';
import { useDeleteMaterial } from '../../../../hooks/useDeleteMaterial';

import { materialService } from '../../../../service/materialEducativoService';
import { downloadBlob, filenameFromContentDisposition } from '../../../../utils/downloadBlob';

import type { MaterialEducativo } from '../../../../interfaces/MaterialEducativo/material.interface';

function guessFilename(m: MaterialEducativo) {
  const ext = (m.url.split('.').pop() || 'bin').toLowerCase();
  const base = (m.titulo || 'material')
    .replace(/[^\w\s.-]+/g, '')
    .trim()
    .replace(/\s+/g, '_');
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
    return materiales.filter((m) => {
      const hitsText =
        m.titulo.toLowerCase().includes(term) ||
        m.descripcion.toLowerCase().includes(term);
      const hitsType = filter === '' || m.tipo === filter;
      return hitsText && hitsType;
    });
  }, [materiales, search, filter]);

  const handleDownload = async (m: MaterialEducativo) => {
    const res = await materialService.download(m.id);
    const cd = res.headers?.['content-disposition'] as string | undefined;
    const nameFromHeader = filenameFromContentDisposition(cd);
    const filename = nameFromHeader || guessFilename(m);
    downloadBlob(res.data, filename);
  };

  if (isLoading) return <p className="text-white text-center">Cargando materiales...</p>;

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold text-center text-white mb-2">
        Plataforma de Material Educativo
      </h1>
      <p className="text-center text-white mb-8">
        Accede a recursos esenciales para la formación y capacitación de Bomberos de Nosara.
      </p>

      <div className="bg-white rounded-lg p-6 shadow">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {filtered.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            onEdit={setEditing}
            onDelete={setToDelete}
            onDownload={handleDownload} // 👈 descarga con token
          />
        ))}
      </div>

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
        onConfirm={(id) => remove(id)}
        isSubmitting={isDeleting}
      />
    </div>
  );
}
