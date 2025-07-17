import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { type CalculatedRiasecResult } from "@/types/dashboard";

interface ScoreBreakdownProps {
  scores: CalculatedRiasecResult['scores'];
}

/**
 * Displays a detailed breakdown of scores for all six RIASEC types.
 */
export function ScoreBreakdown({ scores }: ScoreBreakdownProps) {
  // Convert scores object to an array for easier mapping
  const scoreArray = Object.entries(scores).map(([key, value]) => ({
    type: key.charAt(0).toUpperCase() + key.slice(1),
    score: value,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhamento da Pontuação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        {scoreArray.map(({ type, score }) => (
          <div key={type}>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium">{type}</h3>
              <span className="text-sm text-muted-foreground">{score}%</span>
            </div>
            <Progress value={score} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}