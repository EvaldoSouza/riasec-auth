import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getAllTests } from '@/services/testService';
import { columns } from './columns';
import { TestList } from './testList';
import { Button } from '@/components/ui/button';

export default async function ManageTestsPage() {
  // Security: Ensure only admins can access this page.
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') {
    return redirect('/');
  }

  // Data Fetching: Get the data on the server.
  const tests = await getAllTests();

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciar Testes</h1>
        <Link href="/admin/tests/create">
          <Button>Criar Novo Teste</Button>
        </Link>
      </div>
      
      {/* Rendering: Pass the server-fetched data to the client component. */}
      <TestList columns={columns} data={tests} />
    </div>
  );
}