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

  useEffect(() => {
    if (material) {
      setTitulo(material.titulo ?? '');
      setDescripcion(material.descripcion ?? '');
      setTipo(material.tipo ?? 'PDF');
      setArchivo(null); // archivo requerido: forzamos a elegir uno nuevo
      setArchivoError('');
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

    // ⚠️ Mostrar mensaje si intentan subir más de un archivo
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

    if (!titulo.trim() || !descripcion.trim()) return;

    const err = validateFile(archivo, tipo); // archivo OBLIGATORIO
    if (err) {
      setArchivoError(err);
      return;
    }

    onSubmitWithFile(material.id, {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      tipo,
      archivo: archivo!, // validado arriba
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
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={TITLE_MAX}
            required
            aria-invalid={titleLimit}
            className={`w-full border rounded p-2 ${titleLimit ? 'border-red-500' : ''}`}
            placeholder="Título"
          />
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className={titleLimit ? 'text-red-600' : 'text-gray-500'}>
              {titleCount}/{TITLE_MAX}
            </span>
            {titleLimit && <span className="text-red-600" aria-live="polite">Llegaste al límite ({TITLE_MAX})</span>}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            maxLength={DESC_MAX}
            required
            aria-invalid={descLimit}
            className={`w-full border rounded p-2 ${descLimit ? 'border-red-500' : ''}`}
            placeholder="Descripción"
          />
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className={descLimit ? 'text-red-600' : 'text-gray-500'}>
              {descCount}/{DESC_MAX}
            </span>
            {descLimit && <span className="text-red-600" aria-live="polite">Llegaste al límite ({DESC_MAX})</span>}
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

        {/* Archivo (OBLIGATORIO, solo 1) */}
        <div>
          <input
            ref={fileRef}
            type="file"
            required
            onChange={handleFileChange}
            accept={accept}
            aria-invalid={!!archivoError}
            className={`block w-full border rounded p-2 ${archivoError ? 'border-red-500' : ''}`}
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
