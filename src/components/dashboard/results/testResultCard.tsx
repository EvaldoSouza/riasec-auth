'use client';

import { useState } from 'react';
import { Prisma } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CalculatedRiasecResult } from '@/types/dashboard';
import { ResultsReport } from './resultsReport';
import { ResultsMatrix } from './resultsMatrix';
import { getAllCompletedResults } from '@/services/resultServices';
import { scoresSchema } from '@/lib/zodSchemas';


// Define the shape of the 'application' prop
type UserApplicationsWithResults = Prisma.PromiseReturnType<typeof getAllCompletedResults>;
type ApplicationWithResults = UserApplicationsWithResults[number];



export function TestResultCard({ application }: { application: ApplicationWithResults }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!application.TestResult) {
    return null;
  }

  const parsedScores = scoresSchema.safeParse(application.TestResult.scores);
  if (!parsedScores.success) {
    return (
      <div className="p-6 border rounded-xl shadow-md text-destructive">
        Erro ao validar os resultados deste teste.
      </div>
    );
  }

  const finalResult: CalculatedRiasecResult = {
    riasecCode: application.TestResult.riasecCode,
    scores: parsedScores.data,
  };

  return (
    <div className="p-6 border rounded-xl shadow-md space-y-4">
      {/* HEADER: Always visible */}
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div>
          <h2 className="text-xl font-semibold">{application.application?.title || 'Teste Finalizado'}</h2>
          <p className="text-sm text-muted-foreground">
            Finalizado em: {application.testFinishedAt?.toLocaleDateString('pt-BR')}
          </p>
        </div>
        <Button variant="ghost" size="icon">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* BODY: Conditionally rendered */}
      {isOpen && (
        <div className="space-y-6 pt-4 border-t">
          <ResultsReport result={finalResult} />
          <div>
            <h3 className="text-lg font-bold mb-4">Respostas Detalhadas</h3>
            <ResultsMatrix answers={application.answers} />
          </div>
        </div>
      )}
    </div>
  );
}