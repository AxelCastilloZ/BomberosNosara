// AdminParticipacionesTable.tsx - CON EFECTO HOVER INNOVADOR
import { useState } from "react";
import { useTodasParticipaciones } from "../../../../hooks/useVoluntarios";
import { Participacion } from "../../../../types/voluntarios";
import CambiarEstadoModal from "../../Modals/Voluntarios/CambiarEstadoModal";

export default function AdminParticipacionesTable({ estado }: { estado?: string }) {
  const { data = [] } = useTodasParticipaciones(estado);
  const [selected, setSelected] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <>
      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-red-600">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white">Fecha</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white">Actividad</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white">Descripción</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white">Ubicación</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white">Horas</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white">Voluntario</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((participacion: Participacion) => (
              <tr 
                key={participacion.id} 
                className="hover:bg-gray-50"
                onMouseEnter={() => setHoveredId(participacion.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <td className="px-4 py-2 text-sm text-gray-700">{participacion.fecha}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{participacion.actividad}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{participacion.descripcion}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{participacion.ubicacion}</td>
                
                {/* ESTADO CON EFECTO HOVER */}
                <td className="px-4 py-2">
                  <div className="relative group">
                    {participacion.estado === "rechazada" && participacion.motivoRechazo && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                      participacion.estado === "aprobada" ? "bg-green-200 text-black" :
                      participacion.estado === "pendiente" ? "bg-gray-200 text-black" :
                      "bg-red-100 text-red-700 hover:scale-110"
                    }`}>
                      {participacion.estado}
                    </span>
                    
                    {participacion.estado === "rechazada" && participacion.motivoRechazo && hoveredId === participacion.id && (
                      <div className="absolute z-10 top-full left-0 mt-2 bg-red-50 border-l-4 border-red-500 p-3 rounded shadow-lg max-w-xs animate-fadeIn">
                        <div className="relative">
                          <div className="absolute -top-2 left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-50"></div>
                          <p className="text-sm text-red-800 font-medium">
                            {participacion.motivoRechazo}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-4 py-2 text-sm text-gray-700">{participacion.horasRegistradas}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{participacion.voluntario.username}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => setSelected(participacion.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                  >
                    Gestionar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <CambiarEstadoModal id={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}