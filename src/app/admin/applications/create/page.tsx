import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getAllTests } from '@/services/testService';
import { getAllClientes } from '@/services/userServices';
import { CreateApplicationForm } from './createApplicationForm';

export default async function CreateApplicationPage() {
  // Security Check
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') {
    return redirect('/');
  }

  // Fetch all necessary data for the form concurrently
  const [tests, users] = await Promise.all([
    getAllTests(),
    getAllClientes()
  ]);

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Agendar Nova Aplicação de Teste</h1>
        <p className="text-muted-foreground">
          Preencha os detalhes, selecione um teste e escolha os usuários participantes.
        </p>
      </div>
      
      <CreateApplicationForm tests={tests} users={users} />
    </div>
  );
}