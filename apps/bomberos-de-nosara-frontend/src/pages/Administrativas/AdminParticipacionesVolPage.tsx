import AdminParticipacionesTable from "../../components/ui/Administrativa/Voluntarios/AdminParticipacionesTable";

export default function AdminParticipacionesVolPage() {
  return (
    <div className="p-4 space-y-6 pt-28">
      {/* Panel de bienvenida */}
      <div className="bg-yellow-400 text-black rounded-t-3xl shadow-lg py-20 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Panel de Voluntariado</h2>
          <p className="text-lg text-black">
            Aquí puedes gestionar y revisar las participaciones de los voluntarios,
            aprobar o rechazar registros y mantener las estadísticas al día.
          </p>
        </div>

      </div>

      {/* Sección principal */}
      <div>
        <h1 className="text-2xl font-bold text-black mb-4">
          Participaciones de Voluntarios
        </h1>
        <AdminParticipacionesTable />
      </div>
    </div>
  );
}
