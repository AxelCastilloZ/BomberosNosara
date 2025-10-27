import { motion } from 'framer-motion';
import { AlarmClock } from 'lucide-react';

export const LoadingModal = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <motion.div
        className="bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-lg text-center border-2 border-red-600"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center gap-4">
          <AlarmClock className="h-10 w-10 text-red-600 animate-spin duration-[2s]" />
          <p className="text-red-800 font-semibold">Enviando datos a la estación...</p>
        </div>
      </motion.div>
    </div>
  );
};