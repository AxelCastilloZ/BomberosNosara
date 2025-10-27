import { useState, useMemo, useEffect } from 'react';
import { useDonantes, useAddDonante, useUpdateDonante, useDeleteDonante } from '../service/donorService';
import { Donante } from '../types/donate';
import { useForm } from '@tanstack/react-form';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { LoadingModal } from '../components/ui/Modals/Donantes/LoadingModal';
import { SuccessModal } from '../components/ui/Modals/Donantes/SuccessModal';
import { ConfirmModal } from '../components/ui/Modals/Donantes/ConfirmModal';
import { ErrorModal } from '../components/ui/Modals/Donantes/ErrorModal';

// ===== Límites de caracteres =====
const NAME_MAX = 30;  
const DESC_MAX = 250;  

// utilitos simples
const isNonEmpty = (v?: string) => !!v && v.trim().length > 0;
const isValidUrl = (v?: string) => {
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

// 2 MB por defecto
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export default function AdminDonantesPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: donantesData, isLoading } = useDonantes(page, limit, debouncedSearchTerm);
  const donantes = donantesData?.data || [];
  const total = donantesData?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const { mutate: addDonante } = useAddDonante();
  const { mutate: updateDonante } = useUpdateDonante();
  const { mutate: deleteDonante } = useDeleteDonante();

  const [editingDonante, setEditingDonante] = useState<Donante | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  // Flags para mostrar mensaje al intentar exceder el límite
  const [nameOver, setNameOver] = useState(false);
  const [descOver, setDescOver] = useState(false);

  // ---- FORM ----
  const form = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
      logo: '',
      url: '',
    },
    onSubmit: async ({ value }) => {
      setShowLoading(true);

      // Validación de archivo (requerido solo al crear)
      if (!editingDonante && !logoFile) {
        setShowLoading(false);
        setErrorMsg('El logo es obligatorio. Solo se permite agregar una imagen desde la galería del dispositivo.');
        setShowError(true);
        return;
      }

      try {
        if (editingDonante) {
          await updateDonante({
            id: editingDonante.id,
            ...value,
            logoFile: logoFile ?? undefined,
          });
          setSuccessMsg(`Donante actualizado: ${value.nombre}`);
        } else {
          await addDonante({ ...value, logoFile: logoFile as File });
          setSuccessMsg(`Donante agregado: ${value.nombre}`);
        }
        setShowSuccess(true);
        handleCloseForm();
      } catch (e: any) {
        setErrorMsg(e?.message || 'Ocurrió un error al guardar el donante');
        setShowError(true);
      } finally {
        setShowLoading(false);
        form.reset();
        setLogoFile(null);
        setNameOver(false);
        setDescOver(false);
      }
    },
  });

  const handleEdit = (donante: Donante) => {
    setEditingDonante(donante);
    form.setFieldValue('nombre', donante.nombre);
    form.setFieldValue('descripcion', donante.descripcion);
    form.setFieldValue('logo', donante.logo ?? '');
    form.setFieldValue('url', donante.url);

    setLogoFile(null);

    const absoluteLogo = donante.logo?.startsWith('http')
      ? donante.logo
      : `${import.meta.env.VITE_API_URL}${donante.logo}`;
    setPreview(absoluteLogo);
    setIsFormOpen(true);
    setNameOver(false);
    setDescOver(false);
  };

  const columns = useMemo<ColumnDef<Donante>[]>(() => [
    {
      header: 'Logo',
      accessorKey: 'logo',
      cell: ({ row }) => (
        <div className="flex justify-center items-center">
          <img
            src={`${import.meta.env.VITE_API_URL}${row.original.logo}`}
            alt={row.original.nombre}
            className="h-20 w-20 object-contain mx-auto"
          />
        </div>
      ),
    },
    { header: 'Nombre', accessorKey: 'nombre' },
    {
      header: 'Descripción',
      accessorKey: 'descripcion',
      cell: ({ row }) => {
        const [expanded, setExpanded] = useState(false);

        const descripcion = row.original.descripcion;

        return (
          <div className="max-w-lg text-sm">
            <p
              className={`whitespace-pre-line break-words ${
                expanded ? '' : 'line-clamp-3'
              }`}
            >
              {descripcion}
            </p>
            {descripcion.length > 150 && ( // solo si es texto largo
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-blue-600 hover:underline text-xs mt-1"
              >
                {expanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>
        );
      },
    },

    {
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2 justify-center items-center">
          <button
            onClick={() => handleEdit(row.original)}
            className="text-amber-600 hover:text-amber-700 text-sm"
          >
            Editar
          </button>
          <button
            onClick={() => {
              setToDeleteId(row.original.id);
              setShowConfirmDelete(true);
            }}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: donantes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    pageCount: totalPages,
    manualPagination: true,
    state: { pagination: { pageIndex: page - 1, pageSize: limit } },
    onPaginationChange: (updater) => {
      const newPg = typeof updater === 'function'
        ? updater({ pageIndex: page - 1, pageSize: limit })
        : updater;
      setPage(newPg.pageIndex + 1);
    },
  });

  const handleOpenCreate = () => {
    clearDonanteForm();
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    clearDonanteForm();
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (toDeleteId != null) deleteDonante(toDeleteId);
    setShowConfirmDelete(false);
    setSuccessMsg('Donante eliminado correctamente');
    setShowSuccess(true);
  };

  const clearDonanteForm = () => {
    form.reset();
    setLogoFile(null);
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview('');
    setEditingDonante(null);
    setErrorMsg('');
    setShowError(false);
    setNameOver(false);
    setDescOver(false);
  };

  return (
    <div className="min-h-screen pt-28 bg-gradient-to-b from-white px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-red-800">Administrar Donantes</h1>
          <button
            onClick={handleOpenCreate}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            + Agregar Donante
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 w-full">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 pl-10 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none">
              <path stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"/>
            </svg>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500">Cargando donantes...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 text-sm">
                <thead className="bg-red-100 text-red-800">
                  {table.getHeaderGroups().map(hg => (
                    <tr key={hg.id}>
                      {hg.headers.map(h => (
                        <th key={h.id} className="px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-center text-xs md:text-sm font-bold uppercase tracking-wide">
                          {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {table.getRowModel().rows.map(r => (
                    <tr key={r.id} className="hover:bg-blue-50 transition">
                      {r.getVisibleCells().map(c => (
                        <td key={c.id} className="px-6 py-4 border border-gray-200 text-gray-700 align-top h-full">
                          {flexRender(c.column.columnDef.cell, c.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 mt-12 mb-12">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
                Anterior
              </button>
              <span className="px-2 py-1">Página {page} de {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
                Siguiente
              </button>
            </div>
          </>
        )}
      </div>

      {/* Formulario de creación/edición */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-red-700 mb-6 text-center">
              {editingDonante ? 'Editar Donante' : 'Agregar Donante'}
            </h2>

            <form
              onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}
              className="space-y-4"
            >
              {/* NOMBRE */}
              <form.Field
                name="nombre"
                validators={{
                  onChange: ({ value }) => {
                    if (!isNonEmpty(value)) return 'El nombre es obligatorio.';
                    return undefined;
                  },
                }}
              >
                {(field) => {
                  const val = field.state.value ?? '';
                  const len = val.length;
                  return (
                    <div>
                      <input
                        placeholder="Nombre"
                        value={val}
                        onChange={(e) => {
                          const next = e.target.value;
                          if (next.length > NAME_MAX) setNameOver(true);
                          else if (nameOver) setNameOver(false);
                          field.handleChange(next.slice(0, NAME_MAX));
                        }}
                        // sin maxLength: detectamos intento de exceder
                        className={`w-full border p-2 rounded ${
                          field.state.meta.errors.length || nameOver ? 'border-red-500' : 'border-gray-300'
                        }`}
                        aria-describedby="nombre-help"
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <p id="nombre-help" className="text-red-600">
                          {nameOver ? `No puedes superar ${NAME_MAX} caracteres.` : field.state.meta.errors[0]}
                        </p>
                        <p className={`text-gray-500 ${len === NAME_MAX ? 'text-red-600 font-semibold' : ''}`}>
                          {len}/{NAME_MAX}
                        </p>
                      </div>
                    </div>
                  );
                }}
              </form.Field>

              {/* DESCRIPCIÓN */}
              <form.Field
                name="descripcion"
                validators={{
                  onChange: ({ value }) => {
                    if (!isNonEmpty(value)) return 'La descripción es obligatoria.';
                    return undefined;
                  },
                }}
              >
                {(field) => {
                  const val = field.state.value ?? '';
                  const len = val.length;
                  return (
                    <div>
                      <textarea
                        placeholder="Descripción"
                        value={val}
                        onChange={(e) => {
                          const next = e.target.value;
                          if (next.length > DESC_MAX) setDescOver(true);
                          else if (descOver) setDescOver(false);
                          field.handleChange(next.slice(0, DESC_MAX));
                        }}
                        // sin maxLength: detectamos intento de exceder
                        className={`w-full border p-2 rounded h-24 ${
                          field.state.meta.errors.length || descOver ? 'border-red-500' : 'border-gray-300'
                        }`}
                        aria-describedby="descripcion-help"
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <p id="descripcion-help" className="text-red-600">
                          {descOver ? `No puedes superar ${DESC_MAX} caracteres.` : field.state.meta.errors[0]}
                        </p>
                        <p className={`text-gray-500 ${len === DESC_MAX ? 'text-red-600 font-semibold' : ''}`}>
                          {len}/{DESC_MAX}
                        </p>
                      </div>
                    </div>
                  );
                }}
              </form.Field>

              {/* LOGO */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Logo del donante</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) {
                      setLogoFile(null);
                      setPreview('');
                      return;
                    }
                    // Validaciones de archivo
                    if (!f.type.startsWith('image/')) {
                      setErrorMsg('El archivo seleccionado no es una imagen. Solo se permiten imágenes.');
                      setShowError(true);
                      e.currentTarget.value = '';
                      return;
                    }
                    if (f.size > MAX_IMAGE_BYTES) {
                      setErrorMsg('La imagen supera el tamaño máximo permitido (2 MB).');
                      setShowError(true);
                      e.currentTarget.value = '';
                      return;
                    }
                    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
                    setLogoFile(f);
                    setPreview(URL.createObjectURL(f));
                  }}
                  className="w-full border p-2 rounded border-gray-300"
                />
                <p className="mt-1 text-xs text-gray-600">
                  Solo se permite agregar una <span className="font-semibold">imagen</span>.
                </p>

                {preview && (
                  <img src={preview} alt="Vista previa" className="mt-2 h-20 object-contain" />
                )}

                {/* Mensaje si estás creando y no elegiste imagen */}
                {!editingDonante && !logoFile && (
                  <p className="mt-1 text-xs text-red-600">El logo es obligatorio al crear un donante.</p>
                )}
              </div>

              {/* URL */}
              <form.Field
                name="url"
                validators={{
                  onChange: ({ value }) => {
                    if (!isNonEmpty(value)) return 'La URL del sitio es obligatoria.';
                    if (!isValidUrl(value)) return 'Debe ser una URL válida (http o https).';
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <input
                      placeholder="URL del Sitio"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={`w-full border p-2 rounded ${field.state.meta.errors.length ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {field.state.meta.errors[0] && (
                      <p className="mt-1 text-xs text-red-600">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  {editingDonante ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLoading && <LoadingModal />}
      {showSuccess && <SuccessModal message={successMsg} onClose={() => setShowSuccess(false)} />}
      {showError && <ErrorModal message={errorMsg} onClose={() => setShowError(false)} />}

      {showConfirmDelete && (
        <ConfirmModal
          message="¿Estás seguro de eliminar este donante?"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </div>
  );
}
