interface Props {
  onSearch: (term: string) => void;
  onFilter: (type: string) => void;
  onUploadClick: () => void; // 👈 nuevo prop
}

export default function MaterialFilterBar({ onSearch, onFilter, onUploadClick }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
      <input
        type="text"
        placeholder="Buscar material por título o descripción..."
        className="border rounded p-2 w-full sm:w-1/2"
        onChange={(e) => onSearch(e.target.value)}
      />
      <select
        className="border rounded p-2"
        onChange={(e) => onFilter(e.target.value)}
      >
        <option value="">Todos los tipos</option>
        <option value="PDF">PDF</option>
        <option value="Video">Video</option>
        <option value="Documento">Documento</option>
        <option value="Imagen">Imagen</option>
      </select>
      <button
        className="bg-red-600 text-white px-4 py-2 rounded"
        onClick={onUploadClick} // 👈 usamos prop en lugar de estado local
      >
        ➕ Subir Nuevo Material
      </button>
    </div>
  );
}
