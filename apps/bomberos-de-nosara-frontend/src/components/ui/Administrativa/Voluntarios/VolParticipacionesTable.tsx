import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { useMisParticipaciones } from "../../../../hooks/useVoluntarios";
import { Participacion } from "../../../../types/voluntarios";


const columnHelper = createColumnHelper<Participacion>();

export default function VolParticipacionesTable() {
  const { data: participaciones = [], isLoading } = useMisParticipaciones();
  
  const columns = [
    columnHelper.accessor("fecha", {
      header: "Fecha",
      cell: info => info.getValue() || "Sin fecha",
    }),
    columnHelper.accessor("actividad", {
      header: "Actividad",
      cell: info => info.getValue() || "Sin actividad",
    }),
     columnHelper.accessor("descripcion", {
      header: "Descripción",
      cell: info => info.getValue() || "Sin ubicación",
    }),
    columnHelper.accessor("ubicacion", {
      header: "Ubicación",
      cell: info => info.getValue() || "Sin ubicación",
    }),
    columnHelper.accessor("estado", {
      header: "Estado",
      cell: info => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          info.getValue() === "aprobada" ? "bg-yellow-300 text-black" :
          info.getValue() === "pendiente" ? "bg-gray-200 text-black" :
          "bg-red-100 text-red-700"
        }`}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("horasRegistradas", {
      header: "Horas",
      cell: info => info.getValue() || 0,
    }),
  ];

  const table = useReactTable({
    data: participaciones,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
      {isLoading ? (
        <div className="p-4 text-center">Cargando...</div>
      ) : participaciones.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No hay participaciones registradas</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-red-600 text-white">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-2 text-left">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-100">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2 text-sm text-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}