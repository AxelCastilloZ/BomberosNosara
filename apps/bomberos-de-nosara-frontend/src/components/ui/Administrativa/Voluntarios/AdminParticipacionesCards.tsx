// src/components/ui/Administrativa/Voluntarios/AdminParticipacionesCards.tsx
import { Participacion } from '../../../../types/voluntarios';
import CambiarEstadoModal from '../../Modals/Voluntarios/CambiarEstadoModal';
import ParticipacionModal from '../../Modals/Voluntarios/ParticipacionModal';
import { MapPin, Clock, User, FileText } from 'lucide-react';
import { useState } from 'react';

const TEXTO_LIMITE = 40;

type Props = {
  data: Participacion[];
};

export default function AdminParticipacionesCards({ data }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [modalData, setModalData] = useState<Participacion | null>(null);

  const abrirModal = (p: Participacion) => setModalData(p);
  const cerrarModal = () => setModalData(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((p) => {
          const descLarga = p.descripcion.length > TEXTO_LIMITE;
          const motivo = p.estado === 'rechazada' ? p.motivoRechazo : null;
          const motivoLargo = motivo && motivo.length > TEXTO_LIMITE;
          const mostrarVerMas = descLarga || motivoLargo;

          return (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col justify-between"
            >
              {/* Estado */}
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
                <div className="text-sm text-red-700 bg-red-50 border-l-4 border-red-500 p-2 rounded mb-2">
                  <strong>Motivo:</strong>{' '}
                  {`${motivo.slice(0, TEXTO_LIMITE)}${motivoLargo ? '...' : ''}`}
                </div>
              )}

              {/* Actividad */}
              <h3 className="font-semibold text-gray-800 mb-2">{p.actividad}</h3>

              {/* Descripción */}
              <div className="text-sm text-gray-700 mb-2">
                <FileText className="inline w-4 h-4 mr-1" />
                {`${p.descripcion.slice(0, TEXTO_LIMITE)}${descLarga ? '...' : ''}`}
              </div>

              

              {/* Datos rápidos */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" /> {p.voluntario.username}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {p.horasRegistradas} h
                </div>
                <div className="flex items-center gap-1 col-span-2">
                  <MapPin className="w-4 h-4" /> {p.ubicacion}
                </div>
              </div>

              {/* Botón Ver más */}
              {mostrarVerMas && (
                <button
                  onClick={() => abrirModal(p)}
                  className="text-red-700 hover:underline text-xs mb-3 self-start"
                >
                  Ver más
                </button>
              )}

              {/* Botón Gestionar */}
              <div className="flex justify-end">
                <button
                  onClick={() => setSelected(p.id)}
                  className="bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                >
                  Gestionar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de vista ampliada */}
      <ParticipacionModal data={modalData} onClose={cerrarModal} />

      {selected && (
        <CambiarEstadoModal id={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}