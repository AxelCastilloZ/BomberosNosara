import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface Props {
  message: string;
  onClose: () => void;
}

export function SuccessModal({ message, onClose }: Props) {
  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          as={motion.div}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl z-50 p-6 max-w-sm w-full text-center"
        >
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <Dialog.Title className="text-lg font-bold text-gray-800 mb-2">¡Éxito!</Dialog.Title>
          <p className="text-gray-600 mb-4">{message}</p>
          <button
            onClick={onClose}
            className="bg-lime-600 text-white px-4 py-2 rounded hover:bg-lime-700 transition"
          >
            Cerrar
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}