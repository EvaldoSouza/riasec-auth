"use server";
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTestForUser, getInitialAnswers } from '@/services/testTakingServices';
import { TestPlayer } from '@/components/test/testPlayer';

interface TestPageProps {
  params: {
    applicationID: string;
  };
}

/**
 * The server-side page for the test-taking experience.
 * It handles security, fetches all initial data, and renders the interactive player.
 */
export default async function TestPage({ params }: TestPageProps) {
  const application = await params;

  const session = await auth();
  if (!session?.user?.id) {
    // Redirect unauthenticated users to the sign-in page.
    return redirect(`/sign-in?callbackUrl=/test/${application}`);
  }
  const userId = session.user.id;

  // 2. Data Fetching: Fetch the application data and any existing answers concurrently.
  const [userApplication, initialAnswers] = await Promise.all([
    getTestForUser(userId, application.applicationID),
    getInitialAnswers(userId, application.applicationID)
  ]);

  // 3. Authorization & Error Handling: If no application is found for this user,
  //    it means the application doesn't exist or the user is not authorized.
  if (!userApplication) {
    return notFound();
  }

  if(userApplication.status === 'COMPLETED'){
    return redirect('/dashboard')
  }
  
  // 4. Data Preparation: Extract the clean list of cards to pass to the client.
  const cards = userApplication.application.test.cards.map(tc => tc.card);

  return (
    <div>
      {/* 5. Rendering: Render the main client component, passing all the
          server-fetched data as props. */}
      <TestPlayer
        applicationId={application.applicationID}
        cards={cards}
        initialAnswers={initialAnswers}
      />
    </div>
  );
}