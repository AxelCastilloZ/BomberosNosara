import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { SuggestionForm } from '../../Suggestions/SuggestionForm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSuggestionModal({ isOpen, onClose }: Props) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel as={motion.div}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl z-50 p-6 max-w-lg w-full relative"
        >
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition">
            <X />
          </button>
          <Dialog.Title className="text-lg font-semibold text-gray-700 mb-4">Nueva Sugerencia</Dialog.Title>
          <SuggestionForm onSuccess={onClose} />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}