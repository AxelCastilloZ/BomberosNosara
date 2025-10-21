import React from 'react';

type Props = {
  userName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmDelete: React.FC<Props> = ({ userName, onCancel, onConfirm }) => (
  <div className="border rounded-xl p-4 bg-white shadow-sm">
    <h3 className="text-red-600 font-semibold mb-2">Confirmar eliminación</h3>
    <p className="mb-4">
      ¿Eliminar a <strong>{userName}</strong>? Esta acción no se puede deshacer.
    </p>
    <div className="flex gap-2 justify-end">
      <button onClick={onCancel} className="px-4 py-2 border rounded">Cancelar</button>
      <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Eliminar</button>
    </div>
  </div>
);

export default ConfirmDelete;
