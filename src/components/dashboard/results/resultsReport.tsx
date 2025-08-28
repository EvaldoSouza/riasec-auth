import {
  Card,
  CardContent,
  
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type CalculatedRiasecResult } from "@/types/dashboard";
import { ScoreBreakdown } from "./scoreBreakdown";
import { TypeDescriptions } from "./typeDescriptions";
import { RiasecRadarChart } from "../cliente/riasecRadarChart"; // 1. Import the chart component

interface ResultsReportProps {
  result: CalculatedRiasecResult;
}

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

      {/* --- THIS IS THE NEW SECTION --- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Resumo do Perfil</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-2">
          {/* Left Column: Textual Summary */}
          <div className="space-y-6 flex flex-col justify-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Seu Código RIASEC é:</p>
              <p className="text-6xl font-extrabold tracking-tighter text-primary">{result.riasecCode}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Seus Tipos Dominantes:</p>
              <p className="text-xl font-semibold">{topThreeTypes.join(' • ')}</p>
            </div>
          </div>
          {/* Right Column: Visual Chart */}
          <div>
            <RiasecRadarChart scores={result.scores} />
          </div>
        </CardContent>
      </Card>
      {/* --- END NEW SECTION --- */}

      {/* The other components remain as they were */}
      <ScoreBreakdown scores={result.scores} />
      <TypeDescriptions topTypes={topThreeTypes} />
    </div>
  );
}