// src/components/ui/Modals/Voluntarios/ParticipacionModal.tsx
import { FC } from 'react';
import { Participacion } from '../../../../types/voluntarios';
import { X, User, Clock, MapPin, FileText } from 'lucide-react';

interface Props {
  data: Participacion | null;
  onClose: () => void;
}

const ParticipacionModal: FC<Props> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Estado */}
        <div className="mb-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              data.estado === 'aprobada'
                ? 'bg-green-200 text-black'
                : data.estado === 'pendiente'
                ? 'bg-gray-200 text-black'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {data.estado}
          </span>
        </div>

        {/* Motivo de rechazo (si existe) */}
        {data.estado === 'rechazada' && data.motivoRechazo && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border-l-4 border-red-500 p-3 rounded">
            <strong>Motivo de rechazo:</strong> {data.motivoRechazo}
          </div>
        )}

        {/* Contenido completo */}
        <h2 className="text-xl font-bold text-gray-800 mb-2">{data.actividad}</h2>

        <div className="text-sm text-gray-700 mb-4">
          <FileText className="inline w-4 h-4 mr-1" />
          {data.descripcion}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" /> {data.voluntario.username}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> {data.horasRegistradas} h
          </div>
          <div className="flex items-center gap-1 col-span-2">
            <MapPin className="w-4 h-4" /> {data.ubicacion}
          </div>
          <div className="col-span-2 text-xs text-gray-500">
            Fecha: {data.fecha}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipacionModal;