import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getAllCards } from '@/services/cardService';
import { CreateTestForm } from './createTestForm';

export default async function CreateTestPage() {
  // Security: Ensure only admins can access this page.
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') {
    return redirect('/');
  }

  // Data Fetching: Get all available cards on the server.
  const cards = await getAllCards();

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Criar Novo Teste</h1>
        <p className="text-muted-foreground">
          Dê um nome ao seu teste e selecione os cartões que o compõem.
        </p>
      </div>
      
      {/* Rendering: Pass the server-fetched data to the client component. */}
      <CreateTestForm cards={cards} />
    </div>
  );
}