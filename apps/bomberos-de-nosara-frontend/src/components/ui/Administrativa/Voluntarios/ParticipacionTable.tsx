// ParticipacionTable.tsx - VERSIÓN ULTRA SIMPLE
import { useState } from "react";
import { useTodasParticipaciones } from "../../../../hooks/useVoluntarios";
import { Participacion } from "../../../../types/voluntarios";
import CambiarEstadoModal from "../../Modals/Voluntarios/CambiarEstadoModal";

export default function ParticipacionesTable({ estado }: { estado?: string }) {
  const { data = [] } = useTodasParticipaciones(estado);
  const [selected, setSelected] = useState<number | null>(null);

  console.log('🔍 Datos directos:', data);

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
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No hay participaciones registradas
                </td>
              </tr>
            ) : (
              data.map((participacion: Participacion) => (
                <tr key={participacion.id} className="hover:bg-yellow-50">
                  <td className="px-4 py-2 text-sm text-gray-700">{participacion.fecha}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{participacion.actividad}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{participacion.descripcion}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{participacion.ubicacion}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      participacion.estado === "aprobada" ? "bg-green-100 text-green-700" :
                      participacion.estado === "pendiente" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {participacion.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">{participacion.horasRegistradas}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{participacion.voluntario.username}</td>
                  <td className="px-4 py-2 text-sm">
                    <button
                      onClick={() => setSelected(participacion.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                    >
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <CambiarEstadoModal id={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}