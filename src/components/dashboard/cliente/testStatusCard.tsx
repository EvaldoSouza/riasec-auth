import Link from "next/link";
// 1. Import the ApplicationStatus enum directly from the Prisma client.
import { type ApplicationStatus } from "@prisma/client";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 2. The local 'TestStatus' type is no longer needed.

// 3. Update the props to use the imported ApplicationStatus enum.
interface TestStatusCardProps {
  status: ApplicationStatus | 'NOT_STARTED'; // Accommodate the default initial state
  applicationId?: string;
}

/**
 * A dynamic card that displays the user's test status and provides
 * the primary call to action (CTA).
 */
export function TestStatusCard({ status, applicationId }: TestStatusCardProps) {
  let title: string;
  let description: string;
  let buttonElement: React.ReactNode;

  // 4. Update the switch statement to use the enum members for comparison.
  switch (status) {
    case 'IN_PROGRESS':
      title = "Continue de Onde Parou";
      description = "Você já iniciou o teste. Continue para ver seus resultados.";
      buttonElement = (
        <Button asChild>
          <Link href={`/test/${applicationId}`}>Continuar o Teste</Link>
        </Button>
      );
      break;

    case 'COMPLETED':
      title = "Teste Concluído!";
      description = "Seus resultados estão prontos. Explore seu perfil detalhado e as carreiras que mais combinam com você.";
      buttonElement = (
        <Button asChild>
          <Link href="/dashboard/results">Ver Relatório Completo</Link>
        </Button>
      );
      break;

    case 'NOT_STARTED':
    default:
      title = "Pronto para Começar?";
      description = "Faça o teste para descobrir seu perfil e receber recomendações de carreira personalizadas.";
      buttonElement = (
        <Button asChild>
          <Link href="/test/start">Começar o Teste Agora</Link>
        </Button>
      );
      break;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        {buttonElement}
      </CardFooter>
    </Card>
  );
}