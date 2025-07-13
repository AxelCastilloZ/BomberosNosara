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
import { uploadImage } from '../service/uploadService';
import { Noticia } from '../types/news';

export default function AdminNoticiasPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading } = useNoticias(page, limit);
  const noticias = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;
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
  const [selectedFile, setSelectedFile]=useState<File|null>(null);
  const [previewUrl, setPreviewUrl]=useState<string>('');

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
        
        // Si hay un archivo seleccionado, subirlo primero
        let imageUrl = value.url;
        if (selectedFile) {
          imageUrl = await uploadImage(selectedFile);
        }
        
        // Crear el objeto de noticia con la URL de la imagen
        const noticiaData = {
          ...value,
          url: imageUrl
        };
        
        if (editingNoticia) {
          await new Promise<void>((resolve, reject) => {
            updateNoticia(noticiaData, {
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
            addNoticia(noticiaData, {
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
        setSelectedFile(null);
        setPreviewUrl('');
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Crear URL de preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      console.log(url);
      // Limpiar el campo URL del formulario ya que ahora usamos el archivo
      form.setFieldValue('url', '');
    }
  };

  const handleEdit=(noticia: Noticia) => {
    setEditingNoticia(noticia);
    Object.entries(noticia).forEach(([key, value]) => {
      form.setFieldValue(key as keyof Noticia, value);
    });
    setPreviewUrl(noticia.url);
    setSelectedFile(null);
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
      header: 'Fecha',
      accessorKey: 'fecha',
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">
          {new Date(row.original.fecha).toLocaleDateString('es-ES')}
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
    <div className="min-h-screen pt-28 bg-gradient-to-b from-white px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-red-700">Administrar Noticias</h1>
          <button
            onClick={() => {
              setEditingNoticia(null);
              setSelectedFile(null);
              setPreviewUrl('');
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
          <>
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
          {/* Controles de paginación */}
          <div className="flex justify-end gap-2 mt-12 mb-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-2 py-1">Página {page} de {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          </>
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
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Imagen de la Noticia
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border p-2 rounded"
                  />
                  {(previewUrl || editingNoticia?.url) && (
                    <div className="mt-2">
                      <img
                        src={previewUrl || editingNoticia?.url}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
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
                    onClick={() => {
                      setIsFormOpen(false);
                      setSelectedFile(null);
                      setPreviewUrl('');
                    }}
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
