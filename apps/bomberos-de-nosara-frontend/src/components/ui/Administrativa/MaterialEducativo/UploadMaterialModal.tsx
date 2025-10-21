import { useRef, useState } from 'react';
import { MaterialTipo } from '../../../../interfaces/MaterialEducativo/material.interface';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

const TITLE_MAX = 50;
const DESC_MAX = 70;
const ONE_FILE_MSG = 'Solo se puede seleccionar un archivo.';
const isNonEmpty = (v?: string) => !!v && v.trim().length > 0;

export default function UploadMaterialModal({ isOpen, onClose, onSubmit }: Props) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<MaterialTipo>('PDF');
  const [area, setArea] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoError, setArchivoError] = useState<string>('');
  const [areaTouched, setAreaTouched] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);
  const [descTouched, setDescTouched] = useState(false);
  const [titleOver, setTitleOver] = useState(false);
  const [descOver, setDescOver] = useState(false);
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
    setTipo('PDF');
    setArea('');
    setArchivoError('');
    setTitleOver(false);
    setDescOver(false);
    setTitleTouched(false);
    setDescTouched(false);
    setAreaTouched(false);
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

    if (!isNonEmpty(titulo) || !isNonEmpty(descripcion) || !isNonEmpty(area)) {
      setTitleTouched(true);
      setDescTouched(true);
      setAreaTouched(true);
      return;
    }

    const err = validateFile(archivo, tipo);
    if (err) {
      setArchivoError(err);
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo.trim());
    formData.append('descripcion', descripcion.trim());
    formData.append('tipo', tipo);
    formData.append('area', area.trim());
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
              const next = e.target.value.slice(0, TITLE_MAX);
              setTitulo(next);
            }}
            onBlur={() => setTitleTouched(true)}
            className={`w-full border p-2 rounded ${
              (!isNonEmpty(titulo) && titleTouched) || titleOver
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between text-xs mt-1">
            <p className="text-red-600">
              {!isNonEmpty(titulo) && titleTouched
                ? 'El título es obligatorio.'
                : titleOver
                ? `Máximo ${TITLE_MAX} caracteres.`
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
              const next = e.target.value.slice(0, DESC_MAX);
              setDescripcion(next);
            }}
            onBlur={() => setDescTouched(true)}
            className={`w-full border p-2 rounded h-24 ${
              (!isNonEmpty(descripcion) && descTouched) || descOver
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between text-xs mt-1">
            <p className="text-red-600">
              {!isNonEmpty(descripcion) && descTouched
                ? 'La descripción es obligatoria.'
                : descOver
                ? `Máximo ${DESC_MAX} caracteres.`
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

        {/* 🧭 ÁREA */}
        <div>
          <select
            name="area"
            className={`border rounded p-2 w-full ${
              !isNonEmpty(area) && areaTouched ? 'border-red-500' : 'border-gray-300'
            }`}
            value={area}
            onChange={(e) => setArea(e.target.value)}
            onBlur={() => setAreaTouched(true)}
          >
            <option value="">Seleccione área</option>
            <option value="Incendios Forestales">Incendios Forestales</option>
            <option value="Incendios Industriales">Incendios Industriales</option>
            <option value="Rescates">Rescates Verticales </option>
            <option value="Rescate">Rescates Acuáticos </option>
            <option value="Primeros Auxilios">Primeros Auxilios</option>
            <option value="Reubicación de Animales">Reubicación de Animales</option>
          </select>
          {!isNonEmpty(area) && areaTouched && (
            <p className="text-red-600 text-xs mt-1">El área es obligatoria.</p>
          )}
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
                setArchivoError(err);
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
              const file = files[0];
              const err = validateFile(file, tipo);
              if (err) {
                setArchivoError(err);
                clearFile();
                return;
              }
              setArchivo(file);
              setArchivoError('');
            }}
            accept={acceptMap[tipo]}
            className={`w-full border rounded p-2 ${archivoError ? 'border-red-500' : ''}`}
          />
          <p className="text-xs mt-1 text-gray-500">
            {archivoError ? (
              <span className="text-red-600">{archivoError}</span>
            ) : (
              <>
                {ONE_FILE_MSG} Tipos: {validExtensions[tipo].join(', ')}
              </>
            )}
          </p>
        </div>

        {/* BOTONES */}
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
            disabled={!archivo || !isNonEmpty(area)}
            className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-60"
          >
            Subir
          </button>
        </div>
      </form>
    </div>
  );
}
