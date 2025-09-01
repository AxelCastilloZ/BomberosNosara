import React from 'react';

interface Props {
  onClose: () => void;
}

export default function HistorialMantenimientos({ onClose }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Historial de Mantenimientos</h2>
      <p className="text-sm text-gray-500">Aquí se mostraría la lista completa de mantenimientos realizados, por vehículo.</p>
      <div className="border p-4 rounded bg-slate-100 text-center text-gray-500">
        (Próximamente: integración con backend y tabla de historial)
      </div>
      <div className="flex justify-end">
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Volver</button>
      </div>
    </div>
  );
}