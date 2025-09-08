import { useState, useMemo, useEffect, useCallback } from 'react';
import { useDonantes, useAddDonante, useUpdateDonante, useDeleteDonante, type DonantesResponse, } from '../service/donorService';
import { Donante } from '../types/donate';
import { useForm } from '@tanstack/react-form';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { LoadingModal } from '../components/ui/Modals/Donantes/LoadingModal';
import { SuccessModal } from '../components/ui/Modals/Donantes/SuccessModal';
import { ConfirmModal } from '../components/ui/Modals/Donantes/ConfirmModal';

export default function AdminDonantesPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Debounce the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page when search term changes
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
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
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

// defaultValues
const form = useForm({
  defaultValues: {
    nombre: '',
    descripcion: '',
    logo: '',
    url: '',
  },
  onSubmit: async ({ value }) => {
    setShowLoading(true);

    const camposInvalidos = Object.entries(value).filter(
      ([k, v]) => k !== 'logo' && (!v || String(v).trim() === '')
    );
    if (camposInvalidos.length > 0 || (!editingDonante && !logoFile)) {
      alert('Todos los campos son obligatorios');
      setShowLoading(false);
      return;
    }

    try {
      if (editingDonante) {
        updateDonante({
          id: editingDonante.id,
          ...value,
          logoFile: logoFile ?? undefined, 
        });
        setSuccessMsg(`Donante actualizado: ${value.nombre}`);
      } else {
        if (!logoFile) throw new Error('Debes seleccionar un logo');
        addDonante({ ...value, logoFile });
        setSuccessMsg(`Donante agregado: ${value.nombre}`);
      }
    } catch {
      alert('Error al guardar el donante');
    }

    
    finally {
      setShowLoading(false);
      setShowSuccess(true);
      handleCloseForm();
      setIsFormOpen(false);
      setEditingDonante(null);
      form.reset();
      setLogoFile(null);
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

  const absoluteLogo =
    donante.logo?.startsWith('http')
      ? donante.logo
      : `${import.meta.env.VITE_API_URL}${donante.logo}`;

  setPreview(absoluteLogo);       
  setIsFormOpen(true);
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
  {
    header: 'Nombre',
    accessorKey: 'nombre',
  },
  {
    header: 'Descripción',
    accessorKey: 'descripcion',
    cell: ({ row }) => (
      <div className="max-w-lg whitespace-pre-line break-words text-sm ">
        {row.original.descripcion}
      </div>
    ),
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
  state: {
    pagination: {
      pageIndex: page - 1,
      pageSize: limit,
    },
  },
  onPaginationChange: (updater) => {
    const newPagination = typeof updater === 'function' 
      ? updater({ pageIndex: page - 1, pageSize: limit })
      : updater;
    setPage(newPagination.pageIndex + 1);
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
};

return (
  <div className="min-h-screen pt-28 bg-gradient-to-b from-white px-4">
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-red-800">Administrar Donantes</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-6 w-full">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to first page when searching
            }}
            className="w-full p-2 pl-10 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button
          onClick={() => {
            setEditingDonante(null);
            form.reset();
            setLogoFile(null);
            setPreview("");
            setIsFormOpen(true);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          + Agregar Donante
        </button>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500">Cargando donantes...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 text-sm">
              <thead className="bg-red-100 text-red-800">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th 
                        key={header.id} 
                        className="px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-center text-xs md:text-sm font-bold uppercase tracking-wide"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-300">
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-blue-50 transition">
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 border border-gray-200 text-gray-700 align-top h-full"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            
          {/* Pagination Controls */}
          <div className="flex justify-end gap-2 mt-12 mb-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-2 py-1">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
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
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field name="nombre">
              {(field) => (
                <input
                  placeholder="Nombre"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              )}
            </form.Field>
            <form.Field name="descripcion">
              {(field) => (
                <textarea
                  placeholder="Descripción"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full border p-2 rounded h-24"
                />
              )}
            </form.Field>
            
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
                    setLogoFile(f);
                    setPreview(URL.createObjectURL(f));
                  }
                }}
                className="w-full border p-2 rounded"
              />

              {preview && (
                <img src={preview} alt="Vista previa" className="mt-2 h-20 object-contain" />
              )}
            </div>

            <form.Field name="url">
              {(field) => (
                <input
                  placeholder="URL del Sitio"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full border p-2 rounded"
                />
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
      {showSuccess && (
        <SuccessModal message={successMsg} onClose={() => setShowSuccess(false)} />
      )}
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
