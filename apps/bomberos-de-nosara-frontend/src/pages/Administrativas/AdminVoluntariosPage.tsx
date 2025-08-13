import { useState } from "react";
import ParticipacionForm from "../../components/ui/Administrativa/Voluntarios/ParticipacionForm";
import { useMisParticipaciones, useHorasAprobadas } from "../../hooks/useVoluntarios";

export default function AdminVoluntariosPage() {
  const { data: participaciones = [], isLoading: isLoadingParticipaciones } = useMisParticipaciones();
  const { data: horas = 0, isLoading: isLoadingHoras } = useHorasAprobadas();
  const [showForm, setShowForm] = useState(false);



  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Encabezado */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600"> Registro de Horas</h1>
        <p className="text-gray-600 mt-2">
          Registra tus actividades y lleva el control de tus horas aprobadas.
        </p>
      </div>

      {/* Botón para abrir formulario */}
      <div className="text-center">
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-colors duration-200"
        >
           Registrar Participación
        </button>
      </div>

      {/* Resumen de horas */}
      <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex justify-between items-center shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800">
          Total horas aprobadas:
        </h3>
        <span className="text-2xl font-bold text-red-600">
          {isLoadingHoras ? "..." : horas}
        </span>
      </section>

      {/* Lista de participaciones */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Mis Participaciones
        </h2>

        {isLoadingParticipaciones ? (
          <p className="text-gray-500 italic">Cargando participaciones...</p>
        ) : participaciones.length === 0 ? (
          <p className="text-gray-500 italic">
            No tienes participaciones registradas aún.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
            <table className="min-w-full bg-white">
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Actividad</th>
                  <th className="px-4 py-2 text-left">Ubicación</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Horas</th>
                </tr>
              </thead>
              <tbody>
                {participaciones.map((p: any, index: number) => (
                  <tr
                    key={p.id || index}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-yellow-50`}
                  >
                    <td className="px-4 py-2">{p.fecha}</td>
                    <td className="px-4 py-2">{p.actividad}</td>
                    <td className="px-4 py-2">{p.ubicacion}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          p.estado === "aprobada"
                            ? "bg-green-100 text-green-700"
                            : p.estado === "pendiente"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2">{p.horasRegistradas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Slide-over panel */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setShowForm(false)}
           />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50">
            <div className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Registrar Nueva Participación
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
                  aria-label="Cerrar formulario"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ParticipacionForm onSuccess={() => setShowForm(false)} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}