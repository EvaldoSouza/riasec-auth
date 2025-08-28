"use client"; // This component now has logic and links, so it's a client component.

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserApplicationForDashboard } from "@/services/dashboardService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TestStatusCardProps {
  application: UserApplicationForDashboard | null;
}

export function TestStatusCard({ application }: TestStatusCardProps) {
  
  // Case 1: User has no upcoming or in-progress tests.
  if (!application) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum Teste Agendado</CardTitle>
          <CardDescription>
            Você não possui nenhum teste agendado ou em andamento no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Determine if the test is available to start
  const isAvailableToStart = new Date() >= application.application.availableFrom;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {/* Show a different title based on the status */}
          {application.status === 'IN_PROGRESS' && "Continue seu Teste"}
          {application.status === 'NOT_STARTED' && isAvailableToStart && "Você tem um teste pronto para começar!"}
          {application.status === 'NOT_STARTED' && !isAvailableToStart && "Próximo Teste Agendado"}
        </CardTitle>
        <CardDescription>
          {application.application.test.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* If the test is scheduled for the future, show the date */}
        {application.status === 'NOT_STARTED' && !isAvailableToStart && (
          <p>
            Disponível a partir de:{" "}
            <span className="font-semibold">
              {format(application.application.availableFrom, "PPP 'às' p", { locale: ptBR })}
            </span>
          </p>
        )}
      </CardContent>
      <CardFooter>
        {/* Conditionally render the button */}
        {application.status === 'IN_PROGRESS' && (
          <Button asChild>
            <Link href={`/test/${application.applicationId}`}>Continuar Teste</Link>
          </Button>
        )}
        {application.status === 'NOT_STARTED' && isAvailableToStart && (
          <Button asChild>
            <Link href={`/test/${application.applicationId}`}>Iniciar Teste Agora</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}