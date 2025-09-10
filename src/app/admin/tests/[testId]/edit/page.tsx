"use server";
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTestByIdWithCards } from '@/services/testService';
import { getAllCards } from '@/services/cardService';
import { EditTestForm } from './editTestForm';

export default async function EditTestPage({ params }: {params: Promise<{
    testId: string;
  }>;}) {
  // 1. Security check on the server.
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') {
    return redirect('/');
  }

  const paramsTest = await params

  // 2. Fetch all necessary data concurrently for performance.
  const [test, allCards] = await Promise.all([
    getTestByIdWithCards(paramsTest.testId),
    getAllCards()
  ]);

  // 3. Handle the case where the test ID is invalid.
  if (!test) {
    return notFound();
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Editar Teste</h1>
        <p className="text-muted-foreground">
          Atualize a descrição e os cartões associados a este teste.
        </p>
      </div>
      
      {/* 4. Render the client component, passing all fetched data as props. */}
      <EditTestForm test={test} allCards={allCards} />
    </div>
  );
}