import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { getAllApplications } from '@/services/applicationServices';
import { ApplicationList } from './applicationList'; // We will create this next
import { columns } from './columns'; // We will create this next

/**
 * The main page for managing test applications.
 * It's a Server Component that fetches the initial data.
 */
export default async function ManageApplicationsPage() {
  // 1. Security: Ensure only admins can access this page.
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') {
    return redirect('/');
  }

  // 2. Data Fetching: Get all application data on the server.
  const applications = await getAllApplications();

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold">Gerenciar Aplicações</h1>
            <p className="text-muted-foreground">
                Agende e monitore as aplicações de testes para os usuários.
            </p>
        </div>
        <Link href="/admin/applications/create">
          <Button>Agendar Nova Aplicação</Button>
        </Link>
      </div>
      
      {/* 3. Rendering: Pass the server-fetched data to the client component.
        This component will be responsible for the interactive data table.
        We will build this component in the next step.
      */}
      <ApplicationList columns={columns} data={applications} />
    </div>
  );
}