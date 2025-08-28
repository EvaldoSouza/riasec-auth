import { type Session } from 'next-auth';
import { TestStatusCard } from './testStatusCard';
// import { ResultsOverview } from './resultsOverview';
// import { CareerSuggestionsList } from './careerSuggestionsList';
import { getNextApplicationForUser } from '@/services/dashboardService';


interface ClienteDashboardProps {
  session: Session;
}

export async function ClienteDashboard({ session }: ClienteDashboardProps) {
      
  const userId = session.user.id;
  if (!userId) {
    return <div>Error: Usuário não encontrado.</div>;
  }

  // 2. Call the function from the dynamically imported module.
  // Fetch the user's most relevant application.
  const nextApplication = await getNextApplicationForUser(userId);
  

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">
        Bem-vindo(a) de volta, {session.user.name}!
      </h1>
      
      {/* Pass the entire application object (or null) to the card. */}
      <TestStatusCard application={nextApplication} />

      {/* The results and suggestions sections would be here */}
    </div>
  );
}