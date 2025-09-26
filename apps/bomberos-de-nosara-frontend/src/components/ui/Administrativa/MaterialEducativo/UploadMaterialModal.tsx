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

const isNonEmpty = (v?: string) => !!v && v.trim().length > 0;

export default function UploadMaterialModal({ isOpen, onClose, onSubmit }: Props) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<MaterialTipo>('PDF');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoError, setArchivoError] = useState<string>('');
  const [titleOver, setTitleOver] = useState(false);
  const [descOver, setDescOver] = useState(false);

  // 👇 nuevos estados para controlar si el campo fue tocado
  const [titleTouched, setTitleTouched] = useState(false);
  const [descTouched, setDescTouched] = useState(false);

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
    setTitleOver(false);
    setDescOver(false);
    setTitleTouched(false);
    setDescTouched(false);
    clearFile();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const validateFile = (f: File | null, t: MaterialTipo): string => {
    if (!f) return 'Debes seleccionar un archivo.';
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions[t].includes(ext)) {
      return `El archivo debe ser en formato ${t} (${validExtensions[t].join(', ')}).`;
    }
    return '';
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

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('tipo', tipo);
    formData.append('archivo', archivo!);

    onSubmit(formData);
    resetForm();
    onClose();
  };

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
            placeholder="Título"
            value={titulo}
            onChange={(e) => {
              const next = e.target.value;
              if (next.length > TITLE_MAX) setTitleOver(true);
              else if (titleOver) setTitleOver(false);
              setTitulo(next.slice(0, TITLE_MAX));
            }}
            onBlur={() => setTitleTouched(true)} // 👈 marca como tocado
            className={`w-full border p-2 rounded ${
              (!isNonEmpty(titulo) && titleTouched) || titleOver
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            aria-describedby="titulo-help"
          />
          <div className="flex justify-between text-xs mt-1">
            <p id="titulo-help" className="text-red-600">
              {titleOver
                ? `No puedes superar ${TITLE_MAX} caracteres.`
                : !isNonEmpty(titulo) && titleTouched
                ? 'El título es obligatorio.'
                : ''}
            </p>
            <p
              className={`text-gray-500 ${
                titulo.length === TITLE_MAX ? 'text-red-600 font-semibold' : ''
              }`}
            >
              {titulo.length}/{TITLE_MAX}
            </p>
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div>
          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => {
              const next = e.target.value;
              if (next.length > DESC_MAX) setDescOver(true);
              else if (descOver) setDescOver(false);
              setDescripcion(next.slice(0, DESC_MAX));
            }}
            onBlur={() => setDescTouched(true)} // 👈 marca como tocado
            className={`w-full border p-2 rounded h-24 ${
              (!isNonEmpty(descripcion) && descTouched) || descOver
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            aria-describedby="descripcion-help"
          />
          <div className="flex justify-between text-xs mt-1">
            <p id="descripcion-help" className="text-red-600">
              {descOver
                ? `No puedes superar ${DESC_MAX} caracteres.`
                : !isNonEmpty(descripcion) && descTouched
                ? 'La descripción es obligatoria.'
                : ''}
            </p>
            <p
              className={`text-gray-500 ${
                descripcion.length === DESC_MAX ? 'text-red-600 font-semibold' : ''
              }`}
            >
              {descripcion.length}/{DESC_MAX}
            </p>
          </div>
        </div>

        {/* TIPO */}
        <select
          value={tipo}
          onChange={(e) => {
            const nuevoTipo = e.target.value as MaterialTipo;
            setTipo(nuevoTipo);

            if (archivo) {
              const err = validateFile(archivo, nuevoTipo);
              if (err) {
                setArchivoError(
                  `El archivo seleccionado no coincide con el tipo ${nuevoTipo}. Vuelve a seleccionarlo.`
                );
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

        {/* ARCHIVO */}
        <div>
          <input
            ref={fileRef}
            type="file"
            required
            multiple={false}
            onChange={(e) => {
              const files = e.target.files;
              if (!files || files.length === 0) return;

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
