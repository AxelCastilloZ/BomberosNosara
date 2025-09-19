import { useState, useMemo } from 'react';
import { useMaterialEducativo } from '../../../../hooks/useMaterialEducativo';
import MaterialPublicCard from './MaterialPublicCard';
import { materialService } from '../../../../service/materialEducativoService';
import { downloadBlob, filenameFromContentDisposition } from '../../../../utils/downloadBlob';
import type { MaterialEducativo } from '../../../../interfaces/MaterialEducativo/material.interface';

function guessFilename(m: MaterialEducativo) {
  const ext = (m.url.split('.').pop() || 'bin').toLowerCase();
  const base = (m.titulo || 'material').replace(/[^\w\s.-]+/g, '').trim().replace(/\s+/g, '_');
  return `${base || 'material'}.${ext}`;
}

export default function MaterialPublicGrid() {
  const { materiales, isLoading } = useMaterialEducativo();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

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
    <div className="p-6 bg-gradient-to-b from-red-50 to-white min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
        Material Educativo
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Recursos disponibles para formación y capacitación de voluntarios y personal bomberil.
      </p>

      {/* Barra de búsqueda y filtro */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Buscar material por título o descripción..."
          className="border rounded p-2 w-full sm:w-1/2"
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded p-2"
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="PDF">PDF</option>
          <option value="Video">Video</option>
          <option value="Documento">Documento</option>
          <option value="Imagen">Imagen</option>
        </select>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.map((material) => (
          <MaterialPublicCard
            key={material.id}
            material={material}
            onView={(m) => window.open(m.url, '_blank')}
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
    </div>
  );
}
