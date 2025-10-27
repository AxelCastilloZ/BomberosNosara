import { useState } from 'react';
import { useSuggestions, useDeleteSuggestion } from '../hooks/useSuggestions';
import { ConfirmDeleteModal } from '../components/ui/Modals/suggestions/ConfirmDeleteModal';
import { SuccessModal } from '../components/ui/Modals/suggestions/SuccessSuggestionModal';
import { LoadingModal } from '../components/ui/Modals/Donantes/LoadingModal';
import { Trash2 } from 'lucide-react';

export default function AdminSuggestionsPage() {
  const { data: suggestions = [], isLoading } = useSuggestions();
  const { mutate: deleteSuggestion } = useDeleteSuggestion();

  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showLoading, setShowLoading] = useState(false);

  const handleDelete = () => {
    if (toDeleteId) {
      setShowLoading(true);
      setTimeout(() => {
        deleteSuggestion(toDeleteId);
        setShowConfirm(false);
        setShowLoading(false);
        setSuccessMsg('Sugerencia eliminada correctamente');
        setShowSuccess(true);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen pt-28 px-4 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-red-700 mb-6 text-center">Administrar Sugerencias</h1>

        {isLoading ? (
          <p className="text-center text-gray-500">Cargando sugerencias...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-300 shadow">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-red-100 text-red-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-bold uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-bold uppercase">Teléfono</th>
                  <th className="px-6 py-3 text-left text-sm font-bold uppercase">Contenido</th>
                  <th className="px-6 py-3 text-left text-sm font-bold uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-sm font-bold uppercase">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {suggestions.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 text-gray-700">{s.nombre}</td>
                    <td className="px-6 py-4 text-gray-700">{s.email}</td>
                    <td className="px-6 py-4 text-gray-700">{s.telefono}</td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs break-words">{s.contenido}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(s.fecha).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setToDeleteId(s.id);
                          setShowConfirm(true);
                        }}
                        className="text-red-600 hover:text-red-700 transition flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showConfirm && (
        <ConfirmDeleteModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleDelete}
        />
      )}

      {showLoading && <LoadingModal />}
      {showSuccess && (
        <SuccessModal message={successMsg} onClose={() => setShowSuccess(false)} />
      )}
    </div>
  );
}