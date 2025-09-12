// components/ui/Modals/Donantes/ErrorModal.tsx
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

type Props = { message: string; onClose: () => void };

export const ErrorModal = ({ message, onClose }: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <motion.div
        className="bg-white/90 backdrop-blur-lg p-8 rounded-xl shadow-2xl text-center max-w-sm w-full border-2 border-red-600"
        initial={{ y: -40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.35, type: 'spring' }}
      >
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="h-12 w-12 text-red-600" />
          <p className="text-base font-semibold text-gray-800">{message}</p>
          <button
            onClick={onClose}
            className="mt-3 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
