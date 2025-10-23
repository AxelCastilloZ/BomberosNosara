// src/components/ui/Voluntarios/VolParticipacionesCards.tsx
import { Participacion } from '../../types/voluntarios';
import { MapPin, Clock, FileText, Calendar } from 'lucide-react';
import { useState } from 'react';
import ParticipacionModal from '../modals/ParticipacionModal';
import { useMisParticipaciones } from '../../Hooks/useVoluntarios';

const MAX_DESC = 40;
const MAX_UBIC = 20;

export default function VolParticipacionesCards() {
  const { data: participaciones = [], isLoading } = useMisParticipaciones();
  const [modalData, setModalData] = useState<Participacion | null>(null);

  const abrirModal = (p: Participacion) => setModalData(p);
  const cerrarModal = () => setModalData(null);

  if (isLoading) return <p className="text-center text-gray-600">Cargando...</p>;
  if (participaciones.length === 0)
    return <p className="text-center text-gray-500">No tienes participaciones registradas</p>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {participaciones.map((p) => {
          const descLarga = p.descripcion.length > MAX_DESC;
          const motivo = p.estado === 'rechazada' ? p.motivoRechazo : null;
          const motivoLargo = motivo && motivo.length > 18;
          const ubicCorta = p.ubicacion.length > MAX_UBIC
            ? `${p.ubicacion.slice(0, MAX_UBIC)}...`
            : p.ubicacion;

          // ✅ Mostrar "Ver más" si hay texto oculto
          const mostrarVerMas = descLarga || motivoLargo || p.ubicacion.length > MAX_UBIC;

          return (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col justify-between"
            >
              {/* Estado con color */}
              <div className="mb-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    p.estado === 'aprobada'
                      ? 'bg-green-200 text-black'
                      : p.estado === 'pendiente'
                      ? 'bg-gray-200 text-black'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {p.estado}
                </span>
              </div>

              {/* Motivo de rechazo (preview) */}
              {p.estado === 'rechazada' && motivo && (
                <div className="text-sm border-l-4 border-red-500 pl-2 mb-2 text-red-700">
                  <strong>Motivo:</strong> {`${motivo.slice(0, 18)}${motivoLargo ? '...' : ''}`}
                </div>
              )}

              {/* Actividad */}
              <h3 className="font-semibold text-gray-800 mb-2">{p.actividad}</h3>

              {/* Descripción */}
              <div className="text-sm text-gray-700 mb-2">
                <FileText className="inline w-4 h-4 mr-1" />
                {`${p.descripcion.slice(0, MAX_DESC)}${descLarga ? '...' : ''}`}
              </div>

              {/* Datos rápidos */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {p.fecha}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {(() => {
                    const dec = p.horasRegistradas;
                    const h = Math.floor(dec);
                    const m = Math.round((dec - h) * 60);
                    return `${h} h ${m} min`;
                  })()}
                </div>
                {/* Ubicación recortada con tooltip */}
                <div className="flex items-center gap-1 col-span-2" title={p.ubicacion}>
                  <MapPin className="w-4 h-4" /> {ubicCorta}
                </div>
              </div>

              {/* Ver más si hay texto oculto */}
              {mostrarVerMas && (
                <button
                  onClick={() => abrirModal(p)}
                  className="text-red-700 font-bold hover:underline text-xs mb-3 self-start"
                >
                  Ver más
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal ampliado */}
      <ParticipacionModal data={modalData} onClose={cerrarModal} />
    </>
  );
}