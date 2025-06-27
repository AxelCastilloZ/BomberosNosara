import { useForm } from '@tanstack/react-form';
import { useAddSuggestion } from '../../../hooks/useSuggestions';
import { Suggestion } from '../../../types/suggestion';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import { SuccessModal } from '../Modals/suggestions/SuccessSuggestionModal';
import { LoadingModal } from '../Modals/Donantes/LoadingModal';

export function SuggestionForm({ onSuccess }: { onSuccess?: () => void }) {
  const addMutation = useAddSuggestion();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
      contenido: '',
    },
    onSubmit: async ({ value }) => {
      setShowLoading(true);
      const nueva: Suggestion = {
        ...value,
        id: uuidv4(),
        fecha: new Date().toISOString(),
      };
      setTimeout(async () => {
        await addMutation.mutateAsync(nueva);
        setShowLoading(false);
        setShowSuccess(true);
        form.reset();
        onSuccess?.();
      }, 1000);
    },
  });

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="nombre">
          {(field) => (
            <div>
              <label className="block">Nombre Completo</label>
              <input
                type="text"
                className="input w-full border rounded p-2"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <div>
              <label className="block">Email</label>
              <input
                type="email"
                className="input w-full border rounded p-2"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="telefono">
          {(field) => (
            <div>
              <label className="block">Teléfono</label>
              <input
                type="tel"
                className="input w-full border rounded p-2"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="contenido">
          {(field) => (
            <div>
              <label className="block">Sugerencia</label>
              <textarea
                rows={4}
                className="input w-full border rounded p-2"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>

        <button
          type="submit"
          className="bg-lime-500 text-white px-4 py-2 rounded hover:bg-lime-600 transition-all"
        >
          Enviar sugerencia
        </button>
      </form>

      {showLoading && <LoadingModal />}
      {showSuccess && (
        <SuccessModal
          message="¡Sugerencia enviada correctamente!"
          onClose={() => setShowSuccess(false)}
        />
      )}
    </>
  );
}