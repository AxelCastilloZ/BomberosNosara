import { Suggestion } from '../../../types/suggestion';
import { motion } from 'framer-motion';
import { Flame, CalendarDays, User } from 'lucide-react';

export function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className="relative bg-white/90 backdrop-blur-lg border-l-4 border-red-600 rounded-xl shadow-md hover:shadow-xl transition-all p-5"
    >
      {/* Cabecera simbólica */}
      <div className="flex items-center gap-3 mb-3">
        <Flame className="text-red-600 animate-pulse" size={22} />
        <h3 className="text-lg font-bold text-red-700">Sugerencia ciudadana</h3>
      </div>

      {/* Nombre y fecha */}
      <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <span>{suggestion.nombre}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-gray-500" />
          <span>{new Date(suggestion.fecha).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Contenido */}
      <div className="text-gray-800 mt-2 whitespace-pre-line leading-relaxed">
        {suggestion.contenido}
      </div>
    </motion.div>
  );
}