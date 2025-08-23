"use server"
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getApplicationWithParticipants } from '@/services/applicationServices';
import { getAllTests } from '@/services/testService';
import { getAllClientes } from '@/services/userServices';
import { ApplicationForm } from '../../applicationForm';

interface EditApplicationPageProps {
  params: { applicationId: string };
}

export default async function EditApplicationPage({ params }: EditApplicationPageProps) {
  // Security Check
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') {
    return redirect('/');
  }
  const paramsApplication = await params
  // Fetch all necessary data concurrently
  const [application, tests, users] = await Promise.all([
    getApplicationWithParticipants(paramsApplication.applicationId),
    getAllTests(),
    getAllClientes(),
  ]);

  if (!application) {
    return notFound();
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Editar Aplicação</h1>
        <p className="text-muted-foreground">
          Atualize os detalhes para a aplicação &quot;{application.title}&quot;.
        </p>
      </div>
      
      {/* Render the form in "edit" mode by passing the fetched application data */}
      <ApplicationForm application={application} tests={tests} users={users} />
    </div>
  );
}