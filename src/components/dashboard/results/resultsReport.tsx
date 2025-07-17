import {
  Card,
  //CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type CalculatedRiasecResult } from "@/types/dashboard";
import { ScoreBreakdown } from "./scoreBreakdown";
import { TypeDescriptions } from "./typeDescriptions";

interface ResultsReportProps {
  result: CalculatedRiasecResult;
}

/**
 * The main container component for displaying the full test report.
 * It orchestrates smaller components to show different aspects of the results.
 */
export function ResultsReport({ result }: ResultsReportProps) {
  const typeMap = { R: "Realista", I: "Investigativo", A: "Artístico", S: "Social", E: "Empreendedor", C: "Convencional" };
  const topThreeTypes = result.riasecCode.split('').map(char => typeMap[char as keyof typeof typeMap]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">Seu Relatório Completo</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Aqui está um detalhamento do seu perfil de interesses.
        </p>
      </div>

      {/* Main summary card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Seu Código RIASEC é: <span className="text-primary">{result.riasecCode}</span></CardTitle>
          <CardDescription>{topThreeTypes.join(' • ')}</CardDescription>
        </CardHeader>
      </Card>

      {/* Render the smaller, specialized components */}
      <ScoreBreakdown scores={result.scores} />
      <TypeDescriptions topTypes={topThreeTypes} />
    </div>
  );
}