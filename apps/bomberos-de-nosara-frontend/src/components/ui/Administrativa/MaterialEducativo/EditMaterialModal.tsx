import { useEffect, useMemo, useState } from 'react';
import type { MaterialEducativo, MaterialTipo } from '../../../../interfaces/MaterialEducativo/material.interface';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  material?: MaterialEducativo | null;
  onSubmit: (id: number, data: { titulo: string; descripcion: string; tipo: MaterialTipo }) => void;
  onSubmitWithFile: (id: number, data: { titulo: string; descripcion: string; tipo: MaterialTipo; archivo: File }) => void;
  isSubmitting?: boolean;
}

const validExtensions: Record<MaterialTipo, string[]> = {
  PDF: ['pdf'],
  Video: ['mp4', 'avi', 'mov'],
  Documento: ['doc', 'docx', 'txt'],
  Imagen: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
};

export default function EditMaterialModal({
  isOpen,
  onClose,
  material,
  onSubmit,
  onSubmitWithFile,
  isSubmitting = false,
}: Props) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<MaterialTipo>('PDF');
  const [archivo, setArchivo] = useState<File | null>(null);

  useEffect(() => {
    if (material) {
      setTitulo(material.titulo);
      setDescripcion(material.descripcion);
      setTipo(material.tipo);
      setArchivo(null);
    }
  }, [material]);

  const accept = useMemo(() => {
    const map: Record<MaterialTipo, string> = {
      PDF: '.pdf',
      Video: '.mp4,.avi,.mov',
      Documento: '.doc,.docx,.txt',
      Imagen: '.jpg,.jpeg,.png,.gif,.webp',
    };
    return map[tipo];
  }, [tipo]);

  // si cambias el tipo y el archivo ya no es válido, lo limpiamos
  useEffect(() => {
    if (!archivo) return;
    const ext = archivo.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions[tipo].includes(ext)) setArchivo(null);
  }, [tipo]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen || !material) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions[tipo].includes(ext)) {
      alert(`Archivo no válido para "${tipo}". Permitidos: ${validExtensions[tipo].join(', ')}`);
      e.target.value = '';
      setArchivo(null);
      return;
    }
    setArchivo(f);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (archivo) {
      onSubmitWithFile(material.id, { titulo, descripcion, tipo, archivo });
    } else {
      onSubmit(material.id, { titulo, descripcion, tipo });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Editar Material</h2>

        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          className="w-full border rounded p-2"
          placeholder="Título"
        />

        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          className="w-full border rounded p-2"
          placeholder="Descripción"
        />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as MaterialTipo)}
          className="w-full border rounded p-2"
        >
          <option value="PDF">PDF</option>
          <option value="Video">Video</option>
          <option value="Documento">Documento</option>
          <option value="Imagen">Imagen</option>
        </select>

        <div>
            <input
                type="file"
                onChange={handleFileChange}
                accept={accept}
                className="block"
          />
        </div>


        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded" disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-60" disabled={isSubmitting}>
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
