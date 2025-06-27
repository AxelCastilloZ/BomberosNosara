import { useState } from 'react';
import { SuggestionsGrid } from '../components/ui/Suggestions/SuggestionsGrid';
import { AddSuggestionModal } from '../components/ui/Modals/suggestions/AddSuggestionModal';
import { PlusCircle } from 'lucide-react';

export default function SuggestionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen pt-28 px-4 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-red-700 mb-6 text-center">Quejas, sugerencias o comentarios</h1>
        <p className="text-center text-gray-600 mb-8">
          Estas son algunas de las ideas, recomendaciones o comentarios que hemos recibido.
        </p>

        <SuggestionsGrid />

        <div className="flex justify-center mt-10">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-lime-600 text-white px-5 py-3 rounded-full hover:bg-lime-700 transition"
          >
            <PlusCircle />
            Agregar sugerencia
          </button>
        </div>
      </div>

      <AddSuggestionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}