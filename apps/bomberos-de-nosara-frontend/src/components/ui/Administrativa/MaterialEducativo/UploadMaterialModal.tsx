import { useRef, useState } from 'react';
import { MaterialTipo } from '../../../../interfaces/MaterialEducativo/material.interface';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

const TITLE_MAX = 50;
const DESC_MAX = 80;
const ONE_FILE_MSG = 'Solo se puede seleccionar un archivo.';

export default function UploadMaterialModal({ isOpen, onClose, onSubmit }: Props) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<MaterialTipo>('PDF');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoError, setArchivoError] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validExtensions: Record<MaterialTipo, string[]> = {
    PDF: ['pdf'],
    Video: ['mp4', 'avi', 'mov'],
    Documento: ['doc', 'docx', 'txt'],
    Imagen: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  };

  const acceptMap: Record<MaterialTipo, string> = {
    PDF: '.pdf',
    Video: '.mp4,.avi,.mov',
    Documento: '.doc,.docx,.txt',
    Imagen: '.jpg,.jpeg,.png,.gif,.webp',
  };

  const clearFile = () => {
    setArchivo(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setTipo('Imagen');
    setArchivoError('');
    clearFile();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const validateFile = (f: File | null, t: MaterialTipo): string =>{
    if (!f) return 'Debes seleccionar un archivo.';
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions[t].includes(ext)) {
      return `El archivo debe ser en formato ${t} (${validExtensions[t].join(', ')}).`;
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const err = validateFile(archivo, tipo);
    if (err) {
      setArchivoError(err);
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('tipo', tipo);
    formData.append('archivo', archivo!);

    onSubmit(formData);
    resetForm();
    onClose();
  };

  const titleCount = titulo.length;
  const descCount = descripcion.length;
  const titleLimit = titleCount === TITLE_MAX;
  const descLimit  = descCount === DESC_MAX;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold mb-2 text-center">Subir Nuevo Material</h2>

        {/* TÍTULO */}
        <div>
          <input
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={TITLE_MAX}
            required
            aria-invalid={titleLimit}
            className={`w-full border rounded p-2 ${titleLimit ? 'border-red-500' : ''}`}
          />
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className={titleLimit ? 'text-red-600' : 'text-gray-500'}>
              {titleCount}/{TITLE_MAX}
            </span>
            {titleLimit && (
              <span className="text-red-600" aria-live="polite">
                Llegaste al límite ({TITLE_MAX})
              </span>
            )}
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div>
          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            maxLength={DESC_MAX}
            required
            aria-invalid={descLimit}
            className={`w-full border rounded p-2 ${descLimit ? 'border-red-500' : ''}`}
          />
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className={descLimit ? 'text-red-600' : 'text-gray-500'}>
              {descCount}/{DESC_MAX}
            </span>
            {descLimit && (
              <span className="text-red-600" aria-live="polite">
                Llegaste al límite ({DESC_MAX})
              </span>
            )}
          </div>
        </div>

        {/* TIPO */}
        <select
          value={tipo}
          onChange={(e) => {
            const nuevoTipo = e.target.value as MaterialTipo;
            setTipo(nuevoTipo);

            // Si hay archivo y ya no coincide con el nuevo tipo, limpiar y avisar
            if (archivo) {
              const err = validateFile(archivo, nuevoTipo);
              if (err) {
                setArchivoError(`El archivo seleccionado no coincide con el tipo ${nuevoTipo}. Vuelve a seleccionarlo.`);
                clearFile();
              } else {
                setArchivoError('');
              }
            }
          }}
          className="w-full border rounded p-2"
        >
          <option value="PDF">PDF</option>
          <option value="Video">Video</option>
          <option value="Documento">Documento</option>
          <option value="Imagen">Imagen</option>
        </select>

        {/* ARCHIVO (obligatorio, solo 1) */}
        <div>
          <input
            ref={fileRef}
            type="file"
            required
            multiple={false}
            onChange={(e) => {
              const files = e.target.files;
              if (!files || files.length === 0) return;

              // 🚫 Más de un archivo
              if (files.length > 1) {
                setArchivoError(ONE_FILE_MSG);
                clearFile();
                return;
              }

              const file = files[0] || null;
              const err = validateFile(file, tipo);
              if (err) {
                setArchivoError(err);
                clearFile();
                return;
              }
              setArchivoError('');
              setArchivo(file);
            }}
            // Maneja drag-and-drop múltiple directo sobre el input
            onDrop={(e) => {
              if (e.dataTransfer?.files?.length > 1) {
                e.preventDefault();
                e.stopPropagation();
                setArchivoError(ONE_FILE_MSG);
                clearFile();
              }
            }}
            onDragOver={(e) => {
              // Permite cancelar el drop si detectamos múltiples archivos
              if (e.dataTransfer?.items?.length > 1) {
                e.preventDefault();
              }
            }}
            accept={acceptMap[tipo]}
            aria-invalid={!!archivoError}
            className={`w-full border rounded p-2 ${archivoError ? 'border-red-500' : ''}`}
          />
          <div className="mt-1 text-xs" aria-live="polite">
            {archivoError ? (
              <span className="text-red-600">{archivoError}</span>
            ) : (
              <span className="text-gray-500">
                {ONE_FILE_MSG} Tipos de formatos permitidos: {validExtensions[tipo].join(', ')}
              </span>
            )}
          </div>
        </div>

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
            disabled={!archivo}
            className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-60"
          >
            Subir
          </button>
        </div>
      </form>
    </div>
  );
}
