import { useState } from "react";
import { ConfirmModal } from "../components/ui/Modals/Donantes/ConfirmModal";
import { LoadingModal } from "../components/ui/Modals/Donantes/LoadingModal";
import { SuccessModal } from "../components/ui/Modals/Donantes/SuccessModal";
import {
  useAddNoticia,
  useDeleteNoticia,
  useNoticias,
  useUpdateNoticia,
} from "../service/noticiasService";
import { uploadImage } from "../service/uploadService";
import { Noticia } from "../types/news";
import NoticiasForm from "../components/ui/Administrativa/Noticias/NoticiasForm";
import NoticiasTable from "../components/ui/Administrativa/Noticias/NoticiasTable";



export default function AdminNoticiasPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading } = useNoticias(page, limit);
  const noticias = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const { mutate: addNoticia } = useAddNoticia();
  const { mutate: updateNoticia } = useUpdateNoticia();
  const { mutate: deleteNoticia } = useDeleteNoticia();

  const [editingNoticia, setEditingNoticia] = useState<Noticia | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleSave = async (values: any, file?: File | null) => {
    try {
      setShowLoading(true);

      let imageUrl = values.url;
      if (file) {
        imageUrl = await uploadImage(file);
      }

      const noticiaData = { ...values, url: imageUrl };

      if (editingNoticia) {
        await new Promise<void>((resolve, reject) => {
          updateNoticia(
            { noticia: noticiaData, id: editingNoticia.id! },
            {
              onSuccess: () => {
                setSuccessMsg(`Noticia actualizada: ${values.titulo}`);
                resolve();
              },
              onError: (error) => reject(error),
            }
          );
        });
      } else {
        await new Promise<void>((resolve, reject) => {
          addNoticia(noticiaData, {
            onSuccess: () => {
              setSuccessMsg(`Noticia agregada: ${values.titulo}`);
              resolve();
            },
            onError: (error) => reject(error),
          });
        });
      }

      setShowSuccess(true);
      setIsFormOpen(false);
      setEditingNoticia(null);
    } catch (error) {
      setSuccessMsg(
        `Error: ${
          error instanceof Error ? error.message : "Ocurrió un error"
        }`
      );
      setShowSuccess(true);
    } finally {
      setShowLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setShowLoading(true);
      if (toDeleteId) {
        await new Promise<void>((resolve, reject) => {
          deleteNoticia(toDeleteId, {
            onSuccess: () => {
              setSuccessMsg("Noticia eliminada correctamente");
              resolve();
            },
            onError: (error) => reject(error),
          });
        });
      }
    } catch (error) {
      setSuccessMsg(
        `Error: ${
          error instanceof Error ? error.message : "Ocurrió un error al eliminar"
        }`
      );
    } finally {
      setShowLoading(false);
      setShowConfirmDelete(false);
      setShowSuccess(true);
    }
  };

  return (
    <div className="min-h-screen pt-28 bg-gradient-to-b from-white px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-black">
            Administrar Noticias
          </h1>
          <button
            onClick={() => {
              setEditingNoticia(null);
              setIsFormOpen(true);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            + Agregar Noticia
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500">Cargando noticias...</p>
        ) : (
          <>
            <NoticiasTable
              noticias={noticias}
              onEdit={(noticia) => {
                setEditingNoticia(noticia);
                setIsFormOpen(true);
              }}
              onDelete={(id) => {
                setToDeleteId(id);
                setShowConfirmDelete(true);
              }}
            />
            <div className="flex justify-end gap-2 mt-12 mb-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-2 py-1">
                Página {page} de {totalPages}
              </span>
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

        {isFormOpen && (
          <NoticiasForm
            noticia={editingNoticia}
            onClose={() => setIsFormOpen(false)}
            onSave={handleSave}
          />
        )}

        {showLoading && <LoadingModal />}
        {showSuccess && (
          <SuccessModal
            message={successMsg}
            onClose={() => setShowSuccess(false)}
          />
        )}
        {showConfirmDelete && (
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
