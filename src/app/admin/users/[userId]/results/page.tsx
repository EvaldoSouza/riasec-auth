import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getAllCompletedResults } from '@/services/resultServices';
import { ResultsReport } from '@/components/dashboard/results/resultsReport';
import { ResultsMatrix } from '@/components/dashboard/results/resultsMatrix';
import { z } from 'zod';
import { CalculatedRiasecResult } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { RiasecType } from '@prisma/client';

// 1. The Zod schema is moved back into this page file
const scoresShape = Object.values(RiasecType).reduce((acc, type) => {
  acc[type] = z.number();
  return acc;
}, {} as Record<RiasecType, z.ZodNumber>);
const scoresSchema = z.object(scoresShape);


export default async function UserResultsPage({ params }: {params: Promise<{
    userId: string;
  }>;}) {
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') {
    return redirect('/');
  }

  const userParams = await params;
  const userApplications = await getAllCompletedResults(userParams.userId);

  if (!userApplications || userApplications.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Nenhum resultado encontrado</h1>
        <p className="text-muted-foreground mt-2">
          Este usuário ainda não completou nenhum teste.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/admin/users"><ChevronLeft className="mr-2 h-4 w-4" /> Voltar para Usuários</Link>
        </Button>
      </div>
    );
  }

  const userInfo = userApplications[0]?.user;

  return (
    <div className="w-full space-y-8">
      <Button asChild variant="outline" size="sm">
        <Link href="/admin/users"><ChevronLeft className="mr-2 h-4 w-4" /> Voltar para Usuários</Link>
      </Button>
      
      <h1 className="text-2xl font-bold">
        Histórico de Testes para: <span className="text-primary">{userInfo?.name || userInfo?.email}</span>
      </h1>

      {/* 2. The map loop now contains all the detailed rendering logic */}
      <div className="space-y-6">
        {userApplications.map((application) => {
          if (!application.TestResult) return null;

          const parsedScores = scoresSchema.safeParse(application.TestResult.scores);
          if (!parsedScores.success) {
            return <div key={application.applicationId}>Erro ao carregar os dados de pontuação para este teste.</div>;
          }

          const finalResult: CalculatedRiasecResult = {
            riasecCode: application.TestResult.riasecCode,
            scores: parsedScores.data,
          };

          return (
            <div key={application.applicationId} className="p-6 border rounded-xl shadow-md space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{application.application?.title || 'Teste Finalizado'}</h2>
                <p className="text-sm text-muted-foreground">
                  Finalizado em: {application.testFinishedAt?.toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              {/* The summary report, chart, and matrix are now rendered directly */}
              <div >
                <ResultsReport result={finalResult} />
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4">Respostas Detalhadas</h3>
                <ResultsMatrix answers={application.answers} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}