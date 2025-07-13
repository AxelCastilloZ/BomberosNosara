import { useState, useMemo } from 'react';
import {
  useDonantes,
  useAddDonante,
  useUpdateDonante,
  useDeleteDonante,
} from '../service/donorService';
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
  const { data: donantes = [], isLoading } = useDonantes();
  const { mutate: addDonante } = useAddDonante();
  const { mutate: updateDonante } = useUpdateDonante();
  const { mutate: deleteDonante } = useDeleteDonante();

  const [editingDonante, setEditingDonante] = useState<Donante | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");


  const form = useForm({
    defaultValues: {
      id: '',
      nombre: '',
      descripcion: '',
      logo: '',
      url: '',
    },
    onSubmit: async ({ value }) => {
      setShowLoading(true);

       const camposInvalidos = Object.entries(value).filter(
          ([k, v]) => k !== 'logo' && (!v || v.trim() === '')
        );

        if (camposInvalidos.length > 0 || !logoFile) {
          alert('Todos los campos son obligatorios');
          setShowLoading(false);
          return;
        }

        if (!logoFile && !editingDonante) {
          alert('Debes seleccionar un logo');
          setShowLoading(false);
          return;
        }


        if (!logoFile) {
          alert('Debes seleccionar un archivo de imagen.');
          setShowLoading(false);
          return;
        }


      if (!editingDonante && donantes.some(d => d.id === value.id)) {
        alert('Ya existe un donante con ese ID');
        setShowLoading(false);
        return;
      }

      try {
        if (editingDonante) {
          updateDonante(value);
          setSuccessMsg(`Donante actualizado: ${value.nombre}`);
        } else {
          addDonante({ ...value, logoFile});
          setSuccessMsg(`Donante agregado: ${value.nombre}`);
        }
      } catch (err) {
        alert('Error al guardar el donante');
      } finally {
        setShowLoading(false);
        setShowSuccess(true);
        setIsFormOpen(false);
        setEditingDonante(null);
        form.reset();
        setLogoFile(null);

      }
    },
  });

  const handleEdit = (donante: Donante) => {
    setEditingDonante(donante);
    Object.entries(donante).forEach(([key, value]) => {
      form.setFieldValue(key as keyof Donante, value);
    });
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (toDeleteId) deleteDonante(toDeleteId);
    setShowConfirmDelete(false);
    setSuccessMsg('Donante eliminado correctamente');
    setShowSuccess(true);
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
  });

  return (
    <div className="min-h-screen pt-28 bg-gradient-to-b from-white to-blue-50 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 sm:gap-0 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-700">
            Administrar Donantes
          </h1>
          <button
            onClick={() => {
              setEditingDonante(null);
              form.reset();
              setIsFormOpen(true);
            }}
            className="bg-red-600 text-white text-sm px-4 py-2 rounded hover:bg-red-700 sm:text-base sm:px-6 sm:py-2 w-full sm:w-auto"
          >
            + Agregar Donante
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500">Cargando donantes...</p>
        ) : (
          <>
            {/* Tabla para escritorio */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-300 shadow-md">
              <table className="min-w-full bg-white border border-gray-300 text-sm">
                <thead className="bg-red-100 text-red-800">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-center text-xs md:text-sm font-bold uppercase tracking-wide"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50 transition">
                      {row.getVisibleCells().map((cell) => (
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

            {/* Cards para móviles */}
            <div className="block md:hidden space-y-4">
              {donantes.map((d) => (
                <div
                  key={d.id}
                  className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${d.logo}`}
                      alt={d.nombre}
                      className="w-12 h-12 object-contain border rounded"
                    />
                    <h2 className="text-lg font-bold text-red-700">{d.nombre}</h2>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line break-words mb-2">
                    {d.descripcion}
                  </p>
                  <div className="flex justify-end gap-4 text-sm">
                    <button
                      onClick={() => handleEdit(d)}
                      className="text-amber-600 hover:text-amber-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setToDeleteId(d.id);
                        setShowConfirmDelete(true);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Formulario de creacion de edicion */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xl">
            <h2 className="text-xl font-bold text-red-700 mb-4 text-center">
              {editingDonante ? 'Editar Donante' : 'Agregar Donante'}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
              <form.Field name="id">
                {(field) => (
                  <input
                    placeholder="ID"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full border p-2 rounded"
                    disabled={!!editingDonante}
                  />
                )}
              </form.Field>
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
                    className="w-full border p-2 rounded"
                  />
                )}
              </form.Field>
          
             <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setLogoFile(e.target.files[0]);
                  }
                }}
                className="w-full border p-2 rounded"
              />
              {logoFile && (
                <img
                  src={URL.createObjectURL(logoFile)}
                  alt="Vista previa"
                  className="mt-2 h-20 object-contain"
                />
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
                  onClick={() => setIsFormOpen(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
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
