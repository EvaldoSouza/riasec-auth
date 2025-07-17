import { type Session } from 'next-auth';
import { TestStatusCard } from './testStatusCard';
import { ResultsOverview } from './resultsOverview';
import { CareerSuggestionsList } from './careerSuggestionsList';

// Import the types directly to ensure type safety throughout the component.
import type { getClienteDashboardData as GetDashboardData } from '@/services/dashboardService';


interface ClienteDashboardProps {
  session: Session;
}

export async function ClienteDashboard({ session }: ClienteDashboardProps) {
  // 1. Use a dynamic import() to conditionally load the service file.
  // This is the modern, type-safe alternative to using `require()`.
  // It returns a promise, so we must `await` it.
  const service: { getClienteDashboardData: typeof GetDashboardData } =
    await (process.env.NEXT_PUBLIC_MOCK_API === "true"
      ? import("@/services/dashboardService.mock")
      : import("@/services/dashboardService"));
      
  const userId = session.user.id;
  if (!userId) {
    return <div>Error: User ID not found.</div>;
  }

  // 2. Call the function from the dynamically imported module.
  const dashboardData = await service.getClienteDashboardData(userId);
  
  if (!dashboardData) {
    return <div>Error: Could not load dashboard data. Please try refreshing.</div>;
  }
  
  const { status, result, suggestions, applicationId } = dashboardData;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">
        Welcome back, {session.user.name}!
      </h1>
      
      <TestStatusCard status={status} applicationId={applicationId} />

      {status === 'COMPLETED' && result && (
        <>
          <ResultsOverview results={result} />
          <CareerSuggestionsList suggestions={suggestions} />
        </>
      )}
    </div>
  );
}