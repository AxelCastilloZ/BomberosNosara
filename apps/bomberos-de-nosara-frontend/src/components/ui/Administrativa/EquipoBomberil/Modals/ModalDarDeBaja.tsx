import React, { useState } from 'react';
import type { EquipoBomberil } from '../../../../../interfaces/EquipoBomberil/equipoBomberil';

interface Props {
  equipo: EquipoBomberil;
  onClose: () => void;
  onConfirm: (cantidad: number) => void;
}

export default function ModalDarDeBaja({ equipo, onClose, onConfirm }: Props) {
  const [cantidad, setCantidad] = useState(1);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Dar de baja equipo</h2>
        <p className="mb-4">¿Cuántos ítems deseas dar de baja de <strong>{equipo.catalogo.nombre}</strong>?</p>
        <input
          type="number"
          min={1}
          max={equipo.cantidad}
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          className="input w-full mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 border border-gray-300 rounded">Cancelar</button>
          <button onClick={() => onConfirm(cantidad)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Confirmar</button>
        </div>
      </div>
    </div>
  );
}
