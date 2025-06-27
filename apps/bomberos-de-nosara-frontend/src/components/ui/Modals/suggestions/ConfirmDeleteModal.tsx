import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm }: Props) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel as={motion.div}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl z-50 p-6 max-w-sm w-full text-center"
        >
          <Trash2 className="mx-auto text-red-500 mb-4" size={40} />
          <Dialog.Title className="text-lg font-semibold text-gray-700 mb-2">¿Eliminar sugerencia?</Dialog.Title>
          <p className="text-gray-500 mb-4">Esta acción no se puede deshacer.</p>
          <div className="flex justify-center gap-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">Cancelar</button>
            <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">Eliminar</button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}