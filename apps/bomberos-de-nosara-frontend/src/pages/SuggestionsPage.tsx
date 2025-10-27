import SuggestionForm from "../components/ui/Suggestions/SuggestionForm";

export default function SuggestionsPage() {
  return (
    <main className="pt-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-red-700 mb-4 text-center">
          Enviar sugerencia o comentario
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Comparte tus ideas, recomendaciones o inquietudes con nosotros. Tu opinión es importante.
        </p>
        <SuggestionForm />
      </div>
    </main>
  );
}
