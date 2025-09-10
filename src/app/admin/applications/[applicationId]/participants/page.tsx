"use server"
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getApplicationWithParticipants } from '@/services/applicationServices';
import { ParticipantList } from './participantList';
import { columns } from './columns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';


export default async function ParticipantsPage({ params }: {params: Promise<{
    applicationId: string;
  }>;}) {
  // Security Check
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') {
    return redirect('/');
  }

  // Data Fetching
  const applicationParams = await params
  const application = await getApplicationWithParticipants(applicationParams.applicationId);

  // Not Found Handling
  if (!application) {
    return notFound();
  }

  return (
    <div className="w-full space-y-6">
      <Button asChild variant="outline" size="sm">
        <Link href="/admin/applications"><ChevronLeft className="mr-2 h-4 w-4" /> Voltar para Aplicações</Link>
      </Button>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Participantes</h1>
        <p className="text-muted-foreground">
          Monitorando a aplicação &quot;{application.title}&quot; do teste &quot;{application.test.description}&quot;.
        </p>
      </div>
      
      <ParticipantList columns={columns} data={application.participants} />
    </div>
  );
}