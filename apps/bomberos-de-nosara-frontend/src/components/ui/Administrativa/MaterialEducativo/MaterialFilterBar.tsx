import { useState } from 'react';

interface Props {
  onSearch: (term: string) => void;
  onFilterType: (type: string) => void;
  onFilterArea: (area: string) => void;
  onUploadClick: () => void;
  selectedArea: string; // ✅ recibe el valor actual del área
  selectedType: string; // ✅ recibe el valor actual del tipo
}

export default function MaterialFilterBar({
  onSearch,
  onFilterType,
  onFilterArea,
  onUploadClick,
  selectedArea,
  selectedType,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
      {/* 🔍 Buscar */}
      <input
        type="text"
        placeholder="Buscar material por título"
        className="border rounded p-2 w-full sm:w-1/3"
        onChange={(e) => onSearch(e.target.value)}
      />

      {/* 🧭 Filtro por área */}
      <select
        className="border rounded p-2"
        value={selectedArea} // ✅ controlado por el padre
        onChange={(e) => onFilterArea(e.target.value)}
      >
        <option value="">Todas las áreas</option>
        <option value="Incendios Forestales">Incendios Forestales</option>
        <option value="Incendios Industriales">Incendios Industriales</option>
        <option value="Rescates">Rescates Verticales </option>
        <option value="Rescate">Rescates Acuáticos </option>
        <option value="Primeros Auxilios">Primeros Auxilios</option>
        <option value="Reubicación de Animales">Reubicación de Animales</option>
      </select>

      {/* 📂 Filtro por tipo */}
      <select
        className="border rounded p-2"
        value={selectedType} // ✅ controlado por el padre
        onChange={(e) => onFilterType(e.target.value)}
      >
        <option value="">Todos los tipos</option>
        <option value="PDF">PDF</option>
        <option value="Video">Video</option>
        <option value="Documento">Documento</option>
        <option value="Imagen">Imagen</option>
      </select>

      {/* ➕ Subir nuevo material */}
      <button
        className="bg-red-500 text-white px-4 py-2 rounded"
        onClick={onUploadClick}
      >
        ➕ Subir Nuevo Material
      </button>
    </div>
  );
}
