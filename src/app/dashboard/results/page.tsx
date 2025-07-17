import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ResultsReport } from '@/components/dashboard/results/resultsReport';

// We import the type of the specific function we're going to use.
import type { getDetailedTestResult as GetDetailedTestResult } from '@/services/dashboardService';

export default async function ResultsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect('/sign-in?callbackUrl=/dashboard/results');
  }

  // 1. We update the conditional import to only pull the specific function we need.
  const { getDetailedTestResult }: { getDetailedTestResult: typeof GetDetailedTestResult } =
    await (process.env.NEXT_PUBLIC_MOCK_API === "true"
      ? import("@/services/dashboardService.mock")
      : import("@/services/dashboardService"));

  // 2. We now call our new, more efficient function.
  // This fetches only the data required for the results report.
  const result = await getDetailedTestResult(session.user.id);

  // 3. The rest of the logic remains the same.
  // We handle the case where no result is found.
  if (!result) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Nenhum resultado encontrado</h1>
        <p className="text-muted-foreground mt-2">
          Você precisa completar o teste antes de ver seus resultados.
        </p>
      </div>
    );
  }

  // And render the report component with the data.
  return <ResultsReport result={result} />;
}