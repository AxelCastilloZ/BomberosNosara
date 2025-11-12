import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Noticia } from "../../../../types/news";
import { useMemo, useState } from "react";
import { NoticiaModal } from "../../../ui/Modals/Noticias/NoticiaModal";

interface Props {
  noticias: Noticia[];
  onEdit: (noticia: Noticia) => void;
  onDelete: (id: number) => void;
}

export default function NoticiasTable({ noticias, onEdit, onDelete }: Props) {
  const [modalNoticia, setModalNoticia] = useState<Noticia | null>(null);

  const handleVerMas = (noticia: Noticia) => {
    setModalNoticia(noticia);
  };

  const columns = useMemo<ColumnDef<Noticia>[]>(() => [
    {
      header: "Imagen",
      accessorKey: "url",
      cell: ({ row }) => (
        <img
          src={`${import.meta.env.VITE_API_URL}${row.original.url}`}
          alt={row.original.titulo}
          className="h-20 w-20 object-contain"
          onError={(e) => {
            // Fallback to the original URL if the prefixed one fails
            if (e.currentTarget.src !== row.original.url) {
              e.currentTarget.src = row.original.url;
            }
          }}
        />
      ),
    },
    {
      header: "Título",
      accessorKey: "titulo",
    },
    {
      header: "Descripción",
      accessorKey: "descripcion",
      cell: ({ row }) => {
        const fullText = row.original.descripcion;
        const limit = 100;
        const needsTruncate = fullText.length > limit;

        return (
          <div className="max-w-xs">
            {/* Texto truncado */}
            <span>
              {needsTruncate ? fullText.slice(0, limit) + "..." : fullText}
            </span>

            {/* Botón "Ver más" */}
            {needsTruncate && (
              <button
                onClick={() => handleVerMas(row.original)}
                className="text-blue-600 text-sm ml-1 hover:underline"
              >
                Ver más
              </button>
            )}
          </div>
        );
      },
    },
    {
      header: "Fecha",
      accessorKey: "fecha",
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">
          {new Date(row.original.fecha).toLocaleDateString("es-ES")}
        </div>
      ),
    },
    {
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(row.original)}
            className="text-white hover:bg-gray-600 rounded-full text-sm bg-gray-500 px-2"
          >
            Editar
          </button>
          <button
            onClick={() => row.original.id && onDelete(row.original.id)}
            className="text-white bg-red-800 rounded-full hover:bg-red-700 text-sm px-2"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ], [onEdit, onDelete]);

  const table = useReactTable({
    data: noticias,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      {/* Tabla */}
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
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
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

      {/* Modal de noticia */}
      {modalNoticia && (
        <NoticiaModal
          noticia={modalNoticia}
          isOpen={true}
          onClose={() => setModalNoticia(null)}
        />
      )}
    </>
  );
}
