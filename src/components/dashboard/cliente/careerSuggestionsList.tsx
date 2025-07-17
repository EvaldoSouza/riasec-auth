import { type CareerSuggestion } from "@/types/dashboard";
import { CareerSuggestionCard } from "./careerSuggestionCard";

// 1. Define the props. It expects an array of suggestions.
interface CareerSuggestionsListProps {
  suggestions: CareerSuggestion[];
}

/**
 * A component responsible for displaying the list of career suggestions.
 * It handles the logic for the list, including the title and the empty state.
 */
export function CareerSuggestionsList({ suggestions }: CareerSuggestionsListProps) {
  return (
    <section className="space-y-6">
      {/* 2. A clear and semantic title for the entire section. */}
      <h2 className="text-2xl font-bold">Carreiras Recomendadas</h2>
      
      {/* 3. Best Practice: Handle the "empty state" gracefully. */}
      {/* If the suggestions array is empty or doesn't exist, display a helpful message. */}
      {!suggestions || suggestions.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhuma sugestão de carreira foi encontrada para o seu perfil no momento.
        </p>
      ) : (
        // 4. If suggestions exist, map over the array to render each card.
        <div className="grid gap-4 md:grid-cols-2">
          {suggestions.map((suggestion) => (
            // 5. For each item in the array, render the Card component.
            // We pass the unique `suggestion.id` as the key for React's rendering optimization.
            // We pass the entire suggestion object to the component's `suggestion` prop.
            <CareerSuggestionCard key={suggestion.id} suggestion={suggestion} />
          ))}
        </div>
      )}
    </section>
  );
}