import React from 'react';
import { useForm } from 'react-hook-form';
import { useRegistrarReposicion } from '../../../../hooks/useEquiposBomberiles';
import { ReposicionData } from '../../../../interfaces/EquipoBomberil/reposicionData';

interface Props {
  equipoId: string;
  onClose?: () => void;
}

export default function ReposicionForm({ equipoId, onClose }: Props) {
  const { register, handleSubmit, reset } = useForm<ReposicionData>();
  const registrarReposicion = useRegistrarReposicion();

  const onSubmit = (data: ReposicionData) => {
    registrarReposicion.mutate(
      { id: equipoId, data },
      {
        onSuccess: () => {
          reset();
          if (onClose) onClose();
          alert('Reposición registrada correctamente');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Motivo de reposición</label>
        <input
          {...register('motivo', { required: true })}
          className="input"
          placeholder="Ej: Daño irreversible"
        />
      </div>

      <div>
        <label>Observaciones (opcional)</label>
        <textarea
          {...register('observaciones')}
          className="input"
          rows={3}
          placeholder="Notas adicionales..."
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Enviar reposición
      </button>
    </form>
  );
}
