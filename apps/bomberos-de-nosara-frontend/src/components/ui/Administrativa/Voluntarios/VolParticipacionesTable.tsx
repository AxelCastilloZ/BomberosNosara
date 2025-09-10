// VolParticipacionesTable.tsx - CON EFECTO HOVER INNOVADOR
import { useState } from "react";
import { createColumnHelper, useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { useMisParticipaciones } from "../../../../hooks/useVoluntarios";
import { Participacion } from "../../../../types/voluntarios";

const columnHelper = createColumnHelper<Participacion>();

export default function VolParticipacionesTable() {
  const { data: participaciones = [], isLoading } = useMisParticipaciones();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

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
      cell: info => info.getValue() || "Sin descripción",
    }),
    columnHelper.accessor("ubicacion", {
      header: "Ubicación",
      cell: info => info.getValue() || "Sin ubicación",
    }),
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }: {row:{original:Participacion}}) => {
        const estado = row.original.estado;
        const motivo = row.original.motivoRechazo;
        const id = row.original.id;

        return (
          <div 
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredId(id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Punto indicador cuando es rechazada */}
            {estado === "rechazada" && motivo && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            )}
            
            {/* Estado con efecto hover */}
            <span className={`px-2 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
              estado === "aprobada" ? "bg-green-200 text-black" :
              estado === "pendiente" ? "bg-gray-200 text-black" :
              "bg-red-100 text-black hover:scale-110"
            }`}>
              {estado}
            </span>

            {/* Notita roja con efecto hover */}
            {estado === "rechazada" && motivo && hoveredId === id && (
              <div className="absolute z-10 top-full left-0 mt-2 bg-red-50 border-l-4 border-red-500 p-3 rounded shadow-lg max-w-xs animate-fadeIn">
                <div className="relative">
                  <div className="absolute -top-2 left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-50"></div>
                  <p className="text-sm text-red-800 font-medium">
                    {motivo}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      },
    },
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
          <thead className="bg-red-100 text-red-800">
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