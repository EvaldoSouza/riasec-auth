import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type CalculatedRiasecResult } from "@/types/dashboard";
import { RiasecRadarChart } from "./riasecRadarChart";

// A small helper map to get the full name from the RIASEC code character.
const typeMap = {
  R: "Realista",
  I: "Investigativo",
  A: "Artístico",
  S: "Social",
  E: "Empreendedor",
  C: "Convencional",
};

// Define the component's props.
interface ResultsOverviewProps {
  results: CalculatedRiasecResult;
}

/**
 * A server component that provides a high-level summary of a user's
 * completed RIASEC test, combining textual information with a visual chart.
 */
export function ResultsOverview({ results }: ResultsOverviewProps) {
  // 1. Derive the necessary text from the results prop.
  const topThreeTypes = results.riasecCode
    .split('')
    .map(char => typeMap[char as keyof typeof typeMap])
    .join(', ');

  return (
    // 2. Use the shadcn/ui Card component for a consistent look and feel.
    <Card>
      <CardHeader>
        <CardTitle>Seu Perfil RIASEC</CardTitle>
        <CardDescription>
          Este é um resumo do seu resultado, mostrando seus maiores interesses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 3. Create a responsive two-column grid for the layout. */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left Column: Textual Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Seu Código de Três Letras:</h3>
            <p className="text-5xl font-extrabold tracking-tighter text-primary">
              {results.riasecCode}
            </p>
            <h4 className="font-semibold">Seus Tipos Dominantes:</h4>
            <p className="text-lg text-muted-foreground">{topThreeTypes}</p>
          </div>

          {/* Right Column: Visual Chart */}
          <div>
            {/* 4. Render the Client Component for the chart, passing the scores to it. */}
            <RiasecRadarChart scores={results.scores} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}