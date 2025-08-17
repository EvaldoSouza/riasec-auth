import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getAllCards } from '@/services/cardService'; // Create this service function
import { columns } from './columns';
import { CardList } from './card-list';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';

export default async function ManageCardsPage() {
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') return redirect('/');

  const cards = await getAllCards();

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciar Cartões</h1>
        <Link href="/admin/cards/create">
          <Button>Criar Novo Cartão</Button>
        </Link>
      </div>
      <CardList columns={columns} data={cards} />
    </div>
  );
}