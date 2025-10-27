// MotivoRechazoNotita.tsx
export const MotivoRechazoNotita = ({ motivo }: { motivo?: string }) => {
  if (!motivo || motivo.trim() === '') return null;
  
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-2 rounded-r-lg">
      <p className="text-sm text-yellow-800">
        <strong>Motivo de rechazo:</strong> {motivo}
      </p>
    </div>
  );
};