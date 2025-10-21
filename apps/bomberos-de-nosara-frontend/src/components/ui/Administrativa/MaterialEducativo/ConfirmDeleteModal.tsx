import type { MaterialEducativo } from '../../../../interfaces/MaterialEducativo/material.interface';

interface Props {
  isOpen: boolean;
  material?: MaterialEducativo | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
  isSubmitting?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  material,
  onClose,
  onConfirm,
  isSubmitting = false,
}: Props) {
  if (!isOpen || !material) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-center text-red-700 mb-4">Eliminar material</h2>
        <p className="text-gray-700 mb-6">
          ¿Seguro que deseas eliminar <span className="font-semibold">“{material.titulo}”</span>? 
          Esta acción no se puede deshacer.
        </p>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded bg-rose-600 text-white disabled:opacity-60"
            onClick={() => onConfirm(material.id)}
            disabled={isSubmitting}
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
