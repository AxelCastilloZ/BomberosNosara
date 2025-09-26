import { useEffect, useMemo, useState, useRef } from 'react';
import type { MaterialEducativo, MaterialTipo } from '../../../../interfaces/MaterialEducativo/material.interface';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  material?: MaterialEducativo | null;
  onSubmit: (id: number, data: { titulo: string; descripcion: string; tipo: MaterialTipo }) => void;
  onSubmitWithFile: (id: number, data: { titulo: string; descripcion: string; tipo: MaterialTipo; archivo: File }) => void;
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
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoError, setArchivoError] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  // estados touched y overflow
  const [titleTouched, setTitleTouched] = useState(false);
  const [descTouched, setDescTouched] = useState(false);
  const [titleOver, setTitleOver] = useState(false);
  const [descOver, setDescOver] = useState(false);

  useEffect(() => {
    if (material) {
      setTitulo(material.titulo ?? '');
      setDescripcion(material.descripcion ?? '');
      setTipo(material.tipo ?? 'PDF');
      setArchivo(null);
      setArchivoError('');
      setTitleTouched(false);
      setDescTouched(false);
      setTitleOver(false);
      setDescOver(false);
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

  useEffect(() => {
    if (!archivo) return;
    const ext = archivo.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions[tipo].includes(ext)) {
      setArchivo(null);
      setArchivoError(`El archivo seleccionado no coincide con el tipo ${tipo}. Vuelve a seleccionarlo.`);
      if (fileRef.current) fileRef.current.value = '';
    } else {
      setArchivoError('');
    }
  }, [tipo, archivo]);

  if (!isOpen || !material) return null;

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

    if (!isNonEmpty(titulo) || !isNonEmpty(descripcion)) {
      setTitleTouched(true);
      setDescTouched(true);
      return;
    }

    const err = validateFile(archivo, tipo);
    if (err) {
      setArchivoError(err);
      return;
    }

    onSubmitWithFile(material.id, {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      tipo,
      archivo: archivo!,
    });
  };

  const titleCount = titulo.length;
  const descCount = descripcion.length;
  const titleLimit = titleCount === TITLE_MAX;
  const descLimit = descCount === DESC_MAX;

  const isFormValid =
    !!titulo.trim() &&
    !!descripcion.trim() &&
    !!archivo &&
    !archivoError &&
    !isSubmitting;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Editar Material</h2>

        {/* Título */}
        <div>
          <input
            type="text"
            value={titulo}
            onChange={(e) => {
              const next = e.target.value;
              if (next.length > TITLE_MAX) setTitleOver(true);
              else if (titleOver) setTitleOver(false);
              setTitulo(next.slice(0, TITLE_MAX));
            }}
            onBlur={() => setTitleTouched(true)}
            className={`w-full border p-2 rounded ${
              (!isNonEmpty(titulo) && titleTouched) || titleOver ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Título"
            aria-describedby="titulo-help"
          />
          <div className="mt-1 flex justify-between text-xs">
            <p id="titulo-help" className="text-red-600">
              {titleOver
                ? `No puedes superar ${TITLE_MAX} caracteres.`
                : !isNonEmpty(titulo) && titleTouched
                ? 'El título es obligatorio.'
                : ''}
            </p>
            <p className={`text-gray-500 ${titleCount === TITLE_MAX ? 'text-red-600 font-semibold' : ''}`}>
              {titleCount}/{TITLE_MAX}
            </p>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <textarea
            value={descripcion}
            onChange={(e) => {
              const next = e.target.value;
              if (next.length > DESC_MAX) setDescOver(true);
              else if (descOver) setDescOver(false);
              setDescripcion(next.slice(0, DESC_MAX));
            }}
            onBlur={() => setDescTouched(true)}
            className={`w-full border p-2 rounded h-24 ${
              (!isNonEmpty(descripcion) && descTouched) || descOver ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Descripción"
            aria-describedby="descripcion-help"
          />
          <div className="mt-1 flex justify-between text-xs">
            <p id="descripcion-help" className="text-red-600">
              {descOver
                ? `No puedes superar ${DESC_MAX} caracteres.`
                : !isNonEmpty(descripcion) && descTouched
                ? 'La descripción es obligatoria.'
                : ''}
            </p>
            <p className={`text-gray-500 ${descCount === DESC_MAX ? 'text-red-600 font-semibold' : ''}`}>
              {descCount}/{DESC_MAX}
            </p>
          </div>
        </div>

        {/* Tipo */}
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as MaterialTipo)}
          required
          className="w-full border rounded p-2"
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
            required
            onChange={handleFileChange}
            accept={accept}
            aria-invalid={!!archivoError}
            className={`block w-full border rounded p-2 ${archivoError ? 'border-red-500' : 'border-gray-300'}`}
          />
          <div className="mt-1 text-xs" aria-live="polite">
            {archivoError ? (
              <span className="text-red-600">{archivoError}</span>
            ) : (
              <span className="text-gray-500">
                Solo se puede seleccionar un archivo. Tipos permitidos: {validExtensions[tipo].join(', ')}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded" disabled={isSubmitting}>
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-60"
            disabled={!isFormValid}
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
