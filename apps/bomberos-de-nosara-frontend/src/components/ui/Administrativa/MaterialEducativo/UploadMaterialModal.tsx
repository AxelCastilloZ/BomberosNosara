import { useState } from 'react';
import { MaterialTipo } from '../../../../interfaces/MaterialEducativo/material.interface';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

export default function UploadMaterialModal({ isOpen, onClose, onSubmit }: Props) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<MaterialTipo>('PDF');
  const [archivo, setArchivo] = useState<File | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setTipo('Imagen');
    setArchivo(null);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivo) return;

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('tipo', tipo);
    formData.append('archivo', archivo);

    onSubmit(formData);
    resetForm(); // limpia después de subir
    onClose();   // cierra modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold mb-2 text-center">Subir Nuevo Material</h2>

        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          className="w-full border rounded p-2"
        />

        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          className="w-full border rounded p-2"
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

        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const extension = file.name.split('.').pop()?.toLowerCase();
            const validExtensions: Record<MaterialTipo, string[]> = {
              PDF: ['pdf'],
              Video: ['mp4', 'avi', 'mov'],
              Documento: ['doc', 'docx', 'txt'],
              Imagen: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            };

            const isValid = validExtensions[tipo].includes(extension || '');

            if (!isValid) {
              alert(`El tipo de archivo no es válido para "${tipo}". Tipos permitidos: ${validExtensions[tipo].join(', ')}`);
              e.target.value = '';
              setArchivo(null);
              return;
            }

            setArchivo(file);
          }}
          required
          accept={(() => {
            const map: Record<MaterialTipo, string> = {
              PDF: '.pdf',
              Video: '.mp4,.avi,.mov',
              Documento: '.doc,.docx,.txt',
              Imagen: '.jpg,.jpeg,.png,.gif,.webp',
            };
            return map[tipo];
          })()}
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Subir
          </button>
        </div>
      </form>
    </div>
  );
}
