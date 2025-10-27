import { useEffect, useMemo, useState, useRef } from 'react';
import type { MaterialEducativo, MaterialTipo } from '../../../../interfaces/MaterialEducativo/material.interface';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  material?: MaterialEducativo | null;
  onSubmit: (
    id: number,
    data: { titulo: string; descripcion: string; tipo: MaterialTipo; area: string }
  ) => void;
  onSubmitWithFile: (
    id: number,
    data: { titulo: string; descripcion: string; tipo: MaterialTipo; area: string; archivo: File }
  ) => void;
  isSubmitting?: boolean;
}

const TITLE_MAX = 50;
const DESC_MAX = 100;

const validExtensions: Record<MaterialTipo, string[]> = {
  PDF: ['pdf'],
  Video: ['mp4', 'avi', 'mov'],
  Documento: ['doc', 'docx', 'txt'],
  Imagen: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
};

const ONE_FILE_MSG = 'Solo se puede seleccionar un archivo.';
const isNonEmpty = (v?: string) => !!v && v.trim().length > 0;

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
  const [area, setArea] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoError, setArchivoError] = useState('');
  const [areaTouched, setAreaTouched] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [titleTouched, setTitleTouched] = useState(false);
  const [descTouched, setDescTouched] = useState(false);

  useEffect(() => {
    if (material) {
      setTitulo(material.titulo ?? '');
      setDescripcion(material.descripcion ?? '');
      setTipo(material.tipo ?? 'PDF');
      setArea(material.area ?? '');
      setArchivo(null);
      setArchivoError('');
      setTitleTouched(false);
      setDescTouched(false);
      setAreaTouched(false);
      if (fileRef.current) fileRef.current.value = '';
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

  const validateFile = (f: File | null, t: MaterialTipo): string => {
    if (!f) return 'Debes seleccionar un archivo.';
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions[t].includes(ext)) {
      return `Archivo no válido para "${t}". Permitidos: ${validExtensions[t].join(', ')}`;
    }
    return '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      setArchivo(null);
      setArchivoError(ONE_FILE_MSG);
      e.target.value = '';
      return;
    }

    const f = files[0] || null;
    const err = validateFile(f, tipo);
    if (err) {
      setArchivo(null);
      setArchivoError(err);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    setArchivo(f);
    setArchivoError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isNonEmpty(titulo) || !isNonEmpty(descripcion) || !isNonEmpty(area)) {
      setTitleTouched(true);
      setDescTouched(true);
      setAreaTouched(true);
      return;
    }

    if (archivo) {
      const err = validateFile(archivo, tipo);
      if (err) {
        setArchivoError(err);
        return;
      }

      onSubmitWithFile(material!.id, {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo,
        area: area.trim(),
        archivo,
      });
    } else {
      onSubmit(material!.id, {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo,
        area: area.trim(),
      });
    }
  };

  if (!isOpen || !material) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Editar Material</h2>

        {/* Título */}
        <div>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value.slice(0, TITLE_MAX))}
            onBlur={() => setTitleTouched(true)}
            className="w-full border p-2 rounded border-gray-300"
            placeholder="Título"
          />
        </div>

        {/* Descripción */}
        <div>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value.slice(0, DESC_MAX))}
            onBlur={() => setDescTouched(true)}
            className="w-full border p-2 rounded border-gray-300"
            placeholder="Descripción"
          />
        </div>

        {/* Área */}
        <div>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            onBlur={() => setAreaTouched(true)}
            className="w-full border rounded p-2 border-gray-300"
            required
          >
            <option value="">Seleccione área</option>
            <option value="Incendios Forestales">Incendios Forestales</option>
            <option value="Incendios Industriales">Incendios Industriales</option>
            <option value="Rescates">Rescates Verticales</option>
            <option value="Rescate">Rescates Acuáticos</option>
            <option value="Primeros Auxilios">Primeros Auxilios</option>
            <option value="Reubicación de Animales">Reubicación de Animales</option>
          </select>
        </div>

        {/* Tipo */}
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as MaterialTipo)}
          required
          className="w-full border rounded p-2 border-gray-300"
        >
          <option value="PDF">PDF</option>
          <option value="Video">Video</option>
          <option value="Documento">Documento</option>
          <option value="Imagen">Imagen</option>
        </select>

        {/* Archivo */}
        <div>
          <input
            ref={fileRef}
            type="file"
            onChange={handleFileChange}
            accept={accept}
            className={`block w-full border rounded p-2 ${
              archivoError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {archivoError && <p className="text-red-600 text-xs mt-1">{archivoError}</p>}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-60"
            disabled={isSubmitting}
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
