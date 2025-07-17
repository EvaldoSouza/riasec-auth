import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth'; // Import your main server-side auth helper

// Import the two role-specific dashboard components that will be rendered.
import { ClienteDashboard } from '@/components/dashboard/cliente/clienteDashboard';
import { AplicadorDashboard } from '@/components/dashboard/aplicador/aplicadorDashboard';

// This Page is an async Server Component.
// This allows us to use `await` directly inside it for data fetching.
export default async function DashboardPage() {
  // 1. Securely fetch the session on the server.
  const session = await auth();

  // 2. A robust check for unauthenticated users.
  // While middleware should handle this, it's good practice for page-level security.
  if (!session?.user) {
    // If no user is found in the session, redirect to the sign-in page.
    // We include a callbackUrl so the user is returned to the dashboard after logging in.
    return redirect('/api/auth/signin?callbackUrl=/dashboard');
  }

  // 3. Extract the user's role for routing logic.
  const userRole = session.user.role;

  // 4. Use a switch statement to render the correct component based on the role.
  switch (userRole) {
    case 'CLIENTE':
      // If the user is a 'cliente', render their specific dashboard.
      // We pass the entire session object as a prop.
      return <ClienteDashboard session={session} />;

    case 'APLICADOR':
      // If the user is an 'aplicador', render the admin dashboard.
      return <AplicadorDashboard />;

    default:
      // 5. Handle any unexpected cases (e.g., a user with no role).
      // Redirecting to the homepage is a safe fallback.
      return redirect('/');
  }
}