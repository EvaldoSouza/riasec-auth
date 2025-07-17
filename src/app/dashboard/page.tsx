import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth'; // Import your main server-side auth helper

// Import the two role-specific dashboard components that this page will render.
import { ClienteDashboard } from '@/components/dashboard/cliente/clienteDashboard';
import { AplicadorDashboard } from '@/components/dashboard/aplicador/aplicadorDashboard';

/**
 * This is the main page component for the /dashboard route.
 * It is an async Server Component, which allows us to perform secure,
 * server-side logic before rendering any UI.
 */
export default async function DashboardPage() {
  // Step 1: Securely fetch the user's session on the server.
  const session = await auth();

  // Step 2: As a security measure, check if a user is logged in.
  // If not, redirect them to the sign-in page.
  if (!session?.user) {
    // We include a callbackUrl so the user returns here after logging in.
    return redirect('/sign-in?callbackUrl=/dashboard');
  }

  // Step 3: Extract the user's role to determine which dashboard to show.
  const userRole = session.user.role;

  // Step 4: Use conditional logic to render the correct dashboard.
  switch (userRole) {
    case 'CLIENTE':
      // If the user is a 'cliente', render their specific dashboard component.
      return <ClienteDashboard session={session} />;

    case 'APLICADOR':
      // If the user is an 'aplicador', render the admin dashboard component.
      return <AplicadorDashboard />;

    default:
      // As a fallback, if a user has an unknown role, send them to the homepage.
      return redirect('/');
  }
}