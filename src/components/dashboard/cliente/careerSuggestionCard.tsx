import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type CareerSuggestion } from "@/types/dashboard";

// 1. Define the props for this component.
// It expects to receive a single 'suggestion' object.
interface CareerSuggestionCardProps {
  suggestion: CareerSuggestion;
}

/**
 * A component responsible for displaying a single career suggestion card.
 * It is a "presentational" component; it only displays the data it is given.
 */
export function CareerSuggestionCard({ suggestion }: CareerSuggestionCardProps) {
  return (
    // 2. Use the Card component from shadcn/ui as the main container for a clean, bordered look.
    <Card>
      {/* 3. CardHeader and CardTitle provide consistent padding and heading styles. */}
      <CardHeader>
        <CardTitle>{suggestion.title}</CardTitle>
      </CardHeader>
      {/* 4. CardContent provides consistent padding for the body text. */}
      <CardContent>
        <p className="text-muted-foreground">{suggestion.description}</p>
      </CardContent>
    </Card>
  );
}