import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Noticia } from "../../../../types/news";
import { useMemo } from "react";


interface Props {
  noticias: Noticia[];
  onEdit: (noticia: Noticia) => void;
  onDelete: (id: number) => void;
}

export default function NoticiasTable({ noticias, onEdit, onDelete }: Props) {
  const columns = useMemo<ColumnDef<Noticia>[]>(
    () => [
      {
        header: "Imagen",
        accessorKey: "url",
        cell: ({ row }) => (
          <img
            src={row.original.url}
            alt={row.original.titulo}
            className="h-20 w-20 object-contain"
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
        cell: ({ row }) => (
          <div className="max-w-xs whitespace-pre-line break-words">
            {row.original.descripcion}
          </div>
        ),
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
              className="text-amber-600 hover:text-amber-700 text-sm"
            >
              Editar
            </button>
            <button
              onClick={() => row.original.id && onDelete(row.original.id)}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Eliminar
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data: noticias,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-red-600 text-white">
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
  );
}
