import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getAllCompletedResults } from '@/services/resultServices';
import { ResultsReport } from '@/components/dashboard/results/resultsReport';
import { ResultsMatrix } from '@/components/dashboard/results/resultsMatrix';
import { ReportCard } from '@/components/dashboard/results/reportCard'; 
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { RiasecType } from '@prisma/client';
import { CalculatedRiasecResult } from '@/types/dashboard';

// --- VALIDATION HELPERS ---
const scoresShape = Object.values(RiasecType).reduce((acc, type) => {
  acc[type] = z.number();
  return acc;
}, {} as Record<RiasecType, z.ZodNumber>);
const scoresSchema = z.object(scoresShape);

// --- TRANSFORMER FUNCTION ---
// Isolates complexity. Takes raw DB data -> Returns Clean UI Props or Null
type ApplicationData = Awaited<ReturnType<typeof getAllCompletedResults>>[number];

function getSafeReportData(application: ApplicationData) {
  if (!application.TestResult) return null;

  const parsedScores = scoresSchema.safeParse(application.TestResult.scores);

  if (!parsedScores.success) {
    console.error(`[Data Error] App ID ${application.applicationId}:`, parsedScores.error);
    return null;
  }

  let username;
  if(application.user.name === null){
    username = "Não Informado";
  }else{
    username = application.user.name;
  }

  return {
    id: application.applicationId,
    title: application.application?.title || 'Teste Finalizado',
    formattedDate: application.testFinishedAt?.toLocaleDateString('pt-BR') ?? 'N/A',
    name: username,
    email: application.user.email,
    answers: application.answers,
    finalResult: {
      riasecCode: application.TestResult.riasecCode,
      scores: parsedScores.data,
    } as CalculatedRiasecResult
  };
}

// --- MAIN PAGE ---
export default async function UserResultsPage({ params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') return redirect('/');

  const { userId } = await params;
  const userApplications = await getAllCompletedResults(userId);

  // Handle completely empty user history
  if (!userApplications || userApplications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
        <div className="p-4 bg-muted rounded-full">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Nenhum resultado encontrado</h1>
          <p className="text-muted-foreground">Este usuário ainda não completou nenhum teste.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/users">Voltar para Usuários</Link>
        </Button>
      </div>
    );
  }

  const userInfo = userApplications[0]?.user;

  // Transform data securely
  const validReports = userApplications
    .map(getSafeReportData)
    .filter((r): r is NonNullable<typeof r> => r !== null);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12">
      {/* Navigation & Title */}
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-primary">
          <Link href="/admin/users"><ChevronLeft className="mr-2 h-4 w-4" /> Voltar para lista de usuários</Link>
        </Button>
        
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Avaliações</h1>
          <p className="text-muted-foreground mt-1">
            Candidato: <span className="font-medium text-foreground">{userInfo?.name || userInfo?.email}</span>
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-8">
        {validReports.length > 0 ? (
          validReports.map((report) => (
            <ReportCard 
              key={report.id}
              title={report.title}
              date={report.formattedDate}
              name = {report.name}
              email = {report.email}
            >
              <div className="space-y-10">
                {/* Result Chart */}
                <section>
                  <ResultsReport result={report.finalResult} />
                </section>
                
                {/* Detailed Answers Matrix */}
                {/* 'break-inside-avoid' prevents the matrix from being split across PDF pages awkwardly */}
                <section className="break-inside-avoid pt-4 border-t">
                  <h3 className="text-lg font-bold mb-6">Matriz de Respostas</h3>
                  <ResultsMatrix answers={report.answers} />
                </section>
              </div>
            </ReportCard>
          ))
        ) : (
          <div className="p-6 border border-yellow-200 bg-yellow-50 rounded-lg text-yellow-900">
            Atenção: Existem registros no banco de dados, mas eles estão incompletos e não puderam ser exibidos.
          </div>
        )}
      </div>
    </div>
  );
}