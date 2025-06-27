import { useSuggestions } from '../../../hooks/useSuggestions';
import { SuggestionCard } from './SuggestionCard';

export function SuggestionsGrid() {
  const { data: suggestions } = useSuggestions();

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {suggestions?.slice(0, 4).map((s) => (
        <SuggestionCard key={s.id} suggestion={s} />
      ))}
    </div>
  );
}