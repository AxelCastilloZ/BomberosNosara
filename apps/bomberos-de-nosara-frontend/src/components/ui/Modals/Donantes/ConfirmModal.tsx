import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

type Props = {
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmModal = ({
  title = '¿Confirmar acción?',
  message,
  onConfirm,
  onCancel,
}: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <motion.div
        className="bg-white/80 backdrop-blur-lg border-2 border-yellow-400 p-6 rounded-xl shadow-2xl w-full max-w-md"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.25, type: 'spring' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Flame className="text-yellow-500 h-8 w-8 animate-bounce" />
          <h2 className="text-xl font-bold text-yellow-800">{title}</h2>
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </div>
  );
};