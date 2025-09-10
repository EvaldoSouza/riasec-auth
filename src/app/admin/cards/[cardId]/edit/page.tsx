import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getCardById } from '@/services/cardService';
import { CardForm } from '../../cardForm';

export default async function EditCardPage({ params }: {params: Promise<{
    cardId: string;
  }>;}) {
  // 2. Security: Ensure only authorized users can access this page.
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') {
    return redirect('/');
  }

  // 3. Fetch the specific card using the ID from the URL params.
  const cardParams = await params
  const card = await getCardById(cardParams.cardId);

  // 4. Best Practice: If no card is found for the given ID, render the 404 page.
  if (!card) {
    return notFound();
  }

  return (
    <div className="w-full space-y-6 max-w-2xl">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Editar Cartão</h1>
        <p className="text-muted-foreground">
          Atualize os detalhes do cartão ID: {card.id}
        </p>
      </div>
      
      {/* 5. Render our reusable CardForm, passing the fetched card data as a prop. */}
      {/* This automatically puts the form into "Edit Mode". */}
      <CardForm card={card} />
    </div>
  );
}