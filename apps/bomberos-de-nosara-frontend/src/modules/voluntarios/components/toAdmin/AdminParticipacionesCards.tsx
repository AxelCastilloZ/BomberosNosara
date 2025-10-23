// src/components/ui/Administrativa/Voluntarios/AdminParticipacionesCards.tsx
import { Participacion } from '../../types/voluntarios';
import CambiarEstadoModal from '../modals/CambiarEstadoModal';
import ParticipacionModal from '../modals/ParticipacionModal';
import { MapPin, Clock, User, FileText, Calendar } from 'lucide-react';
import { useState } from 'react';

const TEXTO_LIMITE = 18;
const Max_Desc = 40;
const MAX_UBICACION = 20; 

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
          const descLarga = p.descripcion.length > Max_Desc;
          const motivo = p.estado === 'rechazada' ? p.motivoRechazo : null;
          const motivoLargo = motivo && motivo.length > TEXTO_LIMITE;

          
          const ubicacionCorta = p.ubicacion.length > MAX_UBICACION
            ? `${p.ubicacion.slice(0, MAX_UBICACION)}...`
            : p.ubicacion;

          
          const mostrarVerMas = descLarga || motivoLargo || p.ubicacion.length > MAX_UBICACION;

          return (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
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
                  <div className="text-sm border-b-2 text-red-700 rounded-3xl border-red-500 p-2 mb-2">
                    <strong>Motivo:</strong>{' '}
                    {`${motivo.slice(0, TEXTO_LIMITE)}${motivo.length > TEXTO_LIMITE ? '...' : ''}`}
                  </div>
                )}
              </div>

              {/* Actividad */}
              <h3 className="font-semibold text-gray-800 mb-2">{p.actividad}</h3>

              {/* Descripción */}
              <div className="text-sm text-gray-700 mb-2">
                <FileText className="inline w-4 h-4 mr-1" />
                {`${p.descripcion.slice(0, Max_Desc)}${descLarga ? '...' : ''}`}
              </div>

              {/* Datos rápidos */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                <div className="flex items-center gap-1 font-bold">
                  <User className="w-4 h-4" /> {p.voluntario.username}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {(() => {
                    const dec = p.horasRegistradas;
                    const h = Math.floor(dec);
                    const m = Math.round((dec - h) * 60);
                    return `${h} h ${m} min`;
                  })()}
                </div>
                
                <div className="flex items-center gap-1 col-span-2" title={p.ubicacion}>
                  <MapPin className="w-4 h-4" /> {ubicacionCorta}
                </div>
                <div className="flex items-center gap-1 col-span-2">
                  <Calendar className="w-4 h-4" /> {p.fecha}
                </div>
              </div>

              {/* Botón Ver más */}
              {mostrarVerMas && (
                <button
                  onClick={() => abrirModal(p)}
                  className="text-red-700 font-bold hover:underline text-xs mb-3 self-start"
                >
                  Ver más
                </button>
              )}

              {/* Botón Gestionar */}
              <div className="flex justify-end">
                <button
                  onClick={() => setSelected(p.id)}
                  className="bg-red-800 hover:bg-red-700 text-white px-1 py-1 rounded-md text-sm"
                >
                  Cambiar estado
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de vista ampliada */}
      <ParticipacionModal data={modalData} onClose={cerrarModal} />

      {selected && (
        <CambiarEstadoModal
          id={selected}
          motivoActual={data.find((p) => p.id === selected)?.motivoRechazo || ''}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}