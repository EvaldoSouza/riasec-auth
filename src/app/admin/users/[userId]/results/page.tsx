import { redirect,  } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getLatestCompletedResult } from '@/services/resultServices';
import { ResultsReport } from '@/components/dashboard/results/resultsReport';
import { z } from 'zod';
import { CalculatedRiasecResult } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

// Zod schema to validate the `scores` JSON from the database.
const scoresSchema = z.object({
  realistic: z.number(),
  investigative: z.number(),
  artistic: z.number(),
  social: z.number(),
  enterprising: z.number(),
  conventional: z.number(),
});

export default async function UserResultsPage({ params }: {params: Promise<{
    userId: string;
  }>;}) {
  // 1. Security Check: Ensure the person VIEWING the page is an admin.
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') {
    return redirect('/');
  }

  // 2. Data Fetching: Fetch the results for the user specified in the URL.
  const userParams = await params
  const resultFromDb = await getLatestCompletedResult(userParams.userId);

  // 3. Handle cases where the user has no completed test.
  if (!resultFromDb) {
    // You can fetch the user's name separately to show in the message
    // For now, a generic message is fine.
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Nenhum resultado encontrado</h1>
        <p className="text-muted-foreground mt-2">
          Este usuário ainda não completou nenhum teste.
        </p>
      </div>
    );
  }

  // 4. Safely parse and validate the scores from the JSON field.
  const parsedScores = scoresSchema.safeParse(resultFromDb.scores);
  if (!parsedScores.success) {
    return <div>Ocorreu um erro ao carregar os resultados. Os dados de pontuação estão malformados.</div>;
  }

  // 5. Assemble the final data object for our UI component.
  const finalResult: CalculatedRiasecResult = {
    riasecCode: resultFromDb.riasecCode,
    scores: parsedScores.data,
  };

  return (
    <div className="w-full space-y-6">
      <Button asChild variant="outline" size="sm">
        <Link href="/admin/users"><ChevronLeft className="mr-2 h-4 w-4" /> Voltar para Usuários</Link>
      </Button>
      
      {/* Display a clear title indicating whose report this is. */}
      <h1 className="text-2xl font-bold">
        Exibindo Resultados para: <span className="text-primary">{resultFromDb.userId}</span>
      </h1>

      {/* 6. Reuse the exact same report component from the cliente's dashboard. */}
      <ResultsReport result={finalResult} />
    </div>
  );
}