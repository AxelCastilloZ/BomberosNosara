// CambiarEstadoModal.tsx - VERSIÓN CORREGIDA
import { useState } from "react";
import { useActualizarEstado } from "../../../../hooks/useVoluntarios";


export default function CambiarEstadoModal({ id, onClose }: { id: number; onClose: () => void }) {
  const actualizar = useActualizarEstado();
  const [estado, setEstado] = useState<'aprobada' | 'rechazada'>('aprobada');
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (estado === 'rechazada' && !motivoRechazo.trim()) {
      alert('Debe indicar el motivo del rechazo');
      return;
    }

    try {
      await actualizar.mutateAsync({ id, dto: { estado, motivoRechazo } });
      onClose();
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Cambiar estado</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <select 
              value={estado} 
              onChange={(e) => setEstado(e.target.value as 'aprobada' | 'rechazada')}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="aprobada">Aprobar</option>
              <option value="rechazada">Rechazar</option>
            </select>
          </div>

          {estado === 'rechazada' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Motivo</label>
              <textarea 
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={3}
                placeholder="Escriba el motivo del rechazo..."
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={actualizar.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {actualizar.isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}