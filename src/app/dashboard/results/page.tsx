import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ResultsReport } from '@/components/dashboard/results/resultsReport';
import { getLatestCompletedResult } from '@/services/resultServices';
import { z } from 'zod';
import { CalculatedRiasecResult } from '@/types/dashboard';

// 1. Create a Zod schema to validate the shape of the `scores` JSON from the database.
// This is a crucial step for type safety.
const scoresSchema = z.object({
  realistic: z.number(),
  investigative: z.number(),
  artistic: z.number(),
  social: z.number(),
  enterprising: z.number(),
  conventional: z.number(),
});

export default async function ResultsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect('/sign-in?callbackUrl=/dashboard/results');
  }

  // 2. Fetch the data using our new, efficient service function.
  const resultFromDb = await getLatestCompletedResult(session.user.id);

  // 3. Handle the case where the user has not completed a test yet.
  if (!resultFromDb) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Nenhum resultado encontrado</h1>
        <p className="text-muted-foreground mt-2">
          Você precisa completar um teste antes de ver seus resultados.
        </p>
      </div>
    );
  }
  
  // 4. Safely parse the JSON `scores` field and validate its structure.
  const parsedScores = scoresSchema.safeParse(resultFromDb.scores);
  if (!parsedScores.success) {
    // Handle corrupted or malformed data gracefully.
    console.error("Failed to parse scores from database:", parsedScores.error);
    return <div>Ocorreu um erro ao carregar seus resultados.</div>;
  }

  // 5. Assemble the final, type-safe result object for the UI component.
  const finalResult: CalculatedRiasecResult = {
    riasecCode: resultFromDb.riasecCode,
    scores: parsedScores.data,
  };

  return <ResultsReport result={finalResult} />;
}