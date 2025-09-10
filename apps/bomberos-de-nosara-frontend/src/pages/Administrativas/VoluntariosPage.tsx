import { useState } from "react";
import ParticipacionForm from "../../components/ui/Administrativa/Voluntarios/ParticipacionForm";
import { useHorasAprobadas, useHorasPendientes } from "../../hooks/useVoluntarios";
import VolParticipacionesTable from "../../components/ui/Administrativa/Voluntarios/VolParticipacionesTable";


export default function VoluntariosPage() {
  const { data: horasAprobadas = 0, isLoading: isLoadingHorasA } = useHorasAprobadas();
  const { data: horasPendientes = 0, isLoading: isLoadingHorasP } = useHorasPendientes();
  const [showForm, setShowForm] = useState(false);



  return (
    <div className="p-2 space-y-6 pt-24">
      {/* Encabezado */}
      <div className=" text-red-800 p-6 flex items-center justify-between">
        <div className="p-6">
        <h2 className="text-3xl font-bold mb-2">
          Bienvenido a la sección de registro de horas de voluntarios
        </h2>
        <p className="text-white mt-2">
          Registra aquí tus actividades y lleva el control de tus horas.
        </p>
        </div>
      </div>




      
       {/* Horas aprobadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <section className="bg-white border rounded-e-3xl p-4 flex justify-between items-center shadow-md">
        <h3 className="text-lg font-semibold text-black">
          Total horas aprobadas:
        </h3>
        <span className="text-2xl font-bold text-black">
          {isLoadingHorasA ? "..." : horasAprobadas}
        </span>
      </section>

      {/* Sección de horas pendientes */}
       <section className="bg-white border rounded-s-3xl p-4 flex justify-between items-center shadow-md">
        <h3 className="text-lg font-semibold text-black">
          Total horas pendientes:
        </h3>
        <span className="text-2xl font-bold">
          {isLoadingHorasP ? "..." : horasPendientes} 
        </span>
      </section>
      </div>


     {/* Botón para abrir formulario */}
      <div className="text-center text-white font-semibold">
        <button
          onClick={() => setShowForm(true)}
          className="float-right mr-11 bg-red-800 hover:bg-red-700 px-6 py-2 rounded-lg shadow-2xl transition-colors duration-200 mb-4"
        >
           Registrar participación
        </button>
      </div>



      {/* Lista de participaciones */}
      <section>
       <h2 className="text-2xl font-bold text-black pt-6 mb-3">
        Mis Participaciones
       </h2>
      <VolParticipacionesTable />
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
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
                  aria-label="Cerrar formulario"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pt-1">
                <ParticipacionForm onSuccess={() => setShowForm(false)} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}