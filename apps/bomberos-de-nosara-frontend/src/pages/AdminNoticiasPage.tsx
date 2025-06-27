import { useForm } from '@tanstack/react-form';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { ConfirmModal } from '../components/ui/Modals/Donantes/ConfirmModal';
import { LoadingModal } from '../components/ui/Modals/Donantes/LoadingModal';
import { SuccessModal } from '../components/ui/Modals/Donantes/SuccessModal';
import {
  useAddNoticia,
  useDeleteNoticia,
  useNoticias,
  useUpdateNoticia,
} from '../service/noticiasService';
import { Noticia } from '../types/news';

export default function AdminNoticiasPage() {
  const { data: noticias=[], isLoading }=useNoticias();
  const { mutate: addNoticia }=useAddNoticia();
  const { mutate: updateNoticia }=useUpdateNoticia();
  const { mutate: deleteNoticia }=useDeleteNoticia();

  const [editingNoticia, setEditingNoticia]=useState<Noticia|null>(null);
  const [isFormOpen, setIsFormOpen]=useState(false);
  const [showLoading, setShowLoading]=useState(false);
  const [showSuccess, setShowSuccess]=useState(false);
  const [successMsg, setSuccessMsg]=useState('');
  const [toDeleteId, setToDeleteId]=useState<string|null>(null);
  const [showConfirmDelete, setShowConfirmDelete]=useState(false);

  const form=useForm({
    defaultValues: {
      id: '',
      titulo: '',
      descripcion: '',
      url: '',
      fecha: '',
    },
    onSubmit: async ({ value }) => {
      try {
        setShowLoading(true);
        if (editingNoticia) {
          await new Promise<void>((resolve, reject) => {
            updateNoticia(value, {
              onSuccess: () => {
                setSuccessMsg(`Noticia actualizada: ${value.titulo}`);
                resolve();
              },
              onError: (error) => {
                reject(error);
              }
            });
          });
        } else {
          await new Promise<void>((resolve, reject) => {
            addNoticia(value, {
              onSuccess: () => {
                setSuccessMsg(`Noticia agregada: ${value.titulo}`);
                resolve();
              },
              onError: (error) => {
                reject(error);
              }
            });
          });
        }
        setShowSuccess(true);
        setIsFormOpen(false);
        setEditingNoticia(null);
        form.reset();
      } catch (error) {
        console.error('Error en la operación:', error);
        setSuccessMsg(`Error: ${error instanceof Error? error.message:'Ocurrió un error'}`);
        setShowSuccess(true);
      } finally {
        setShowLoading(false);
      }
    },
  });

  const handleEdit=(noticia: Noticia) => {
    setEditingNoticia(noticia);
    Object.entries(noticia).forEach(([key, value]) => {
      form.setFieldValue(key as keyof Noticia, value);
    });
    setIsFormOpen(true);
  };

  const handleDelete=async () => {
    try {
      setShowLoading(true);
      if (toDeleteId) {
        await new Promise<void>((resolve, reject) => {
          deleteNoticia(toDeleteId, {
            onSuccess: () => {
              setSuccessMsg('Noticia eliminada correctamente');
              resolve();
            },
            onError: (error) => {
              reject(error);
            }
          });
        });
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      setSuccessMsg(`Error: ${error instanceof Error? error.message:'Ocurrió un error al eliminar'}`);
    } finally {
      setShowLoading(false);
      setShowConfirmDelete(false);
      setShowSuccess(true);
    }
  };

  const columns=useMemo<ColumnDef<Noticia>[]>(() => [
    {
      header: 'Imagen',
      accessorKey: 'url',
      cell: ({ row }) => (
        <img
          src={row.original.url}
          alt={row.original.titulo}
          className="h-20 w-20 object-contain"
        />
      ),
    },
    {
      header: 'Título',
      accessorKey: 'titulo',
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

  const table=useReactTable({
    data: noticias,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen pt-28 bg-gradient-to-b from-white to-blue-50 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-red-700">Administrar Noticias</h1>
          <button
            onClick={() => {
              setEditingNoticia(null);
              form.reset();
              setIsFormOpen(true);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            + Agregar Noticia
          </button>
        </div>

        {isLoading? (
          <p className="text-center text-gray-500">Cargando noticias...</p>
        ):(
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

        {isFormOpen&&(
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xl">
              <h2 className="text-xl font-bold text-red-700 mb-4 text-center">
                {editingNoticia? 'Editar Noticia':'Agregar Noticia'}
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
                    />
                  )}
                </form.Field>
                <form.Field name="titulo">
                  {(field) => (
                    <input
                      placeholder="Título"
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
                <form.Field name="url">
                  {(field) => (
                    <input
                      placeholder="URL de la Imagen"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full border p-2 rounded"
                    />
                  )}
                </form.Field>
                <form.Field name="fecha">
                  {(field) => (
                    <input
                      placeholder="Fecha"
                      type="date"
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
                    {editingNoticia? 'Actualizar':'Agregar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showLoading&&<LoadingModal />}
        {showSuccess&&(
          <SuccessModal message={successMsg} onClose={() => setShowSuccess(false)} />
        )}
        {showConfirmDelete&&(
          <ConfirmModal
            message="¿Estás seguro de eliminar esta noticia?"
            onConfirm={handleDelete}
            onCancel={() => setShowConfirmDelete(false)}
          />
        )}
      </div>
    </div>
  );
}
