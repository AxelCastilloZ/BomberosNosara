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
        ([_, v]) => !v || v.trim() === ''
      );
      if (camposInvalidos.length > 0) {
        alert('Todos los campos son obligatorios');
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
          addDonante(value);
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
        <img
          src={row.original.logo}
          alt={row.original.nombre}
          className="h-30 w-30 object-contain"
        />
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
        <div className="max-w-xs whitespace-pre-line break-words">
          {row.original.descripcion}
        </div>
      ),
    },
    {
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-red-700">Administrar Donantes</h1>
          <button
            onClick={() => {
              setEditingDonante(null);
              form.reset();
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
          <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-red-100 text-red-800">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 border border-gray-300 text-left text-sm font-bold uppercase tracking-wide"
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
                        className="px-6 py-4 border border-gray-200 text-gray-700 align-top"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formulario de creación/edición */}
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
              <form.Field name="logo">
                {(field) => (
                  <input
                    placeholder="URL del Logo"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                )}
              </form.Field>
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
