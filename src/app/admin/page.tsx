import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { FileText, BookCopy, Users, ClipboardList } from 'lucide-react';

/**
 * The main landing page for the admin section.
 * It provides navigation to the different management areas.
 */
export default async function AdminPage() {
  // 1. Best Practice: Add a security check at the page level.
  // Although middleware protects the route, this ensures that only users
  // with the 'APLICADOR' role can view this page.
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') {
    // Redirect non-admins to the homepage or a 404 page.
    return redirect('/');
  }

  // 2. An array to define our navigation items. This makes the code cleaner
  // and easier to update if you add more admin pages.
  const adminSections = [
    {
      title: 'Testes',
      description: 'Crie e gerencie os modelos de testes RIASEC.',
      href: '/admin/tests',
      icon: <BookCopy className="h-8 w-8 text-muted-foreground" />,
    },
    {
      title: 'Aplicações',
      description: 'Gerencie as aplicações dos testes para os usuários.',
      href: '/admin/applications',
      icon: <FileText className="h-8 w-8 text-muted-foreground" />,
    },
    {
      title: 'Cartões',
      description: 'Gerencie as perguntas individuais (cartões) dos testes.',
      href: '/admin/cards',
      icon: <ClipboardList className="h-8 w-8 text-muted-foreground" />,
    },
    {
      title: 'Usuários',
      description: 'Visualize e gerencie todos os usuários da plataforma.',
      href: '/admin/users',
      icon: <Users className="h-8 w-8 text-muted-foreground" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground">
          Selecione uma área para começar a gerenciar.
        </p>
      </div>
      
      {/* 3. A responsive grid for the navigation cards. */}
      <div className="grid gap-6 md:grid-cols-2">
        {adminSections.map((section) => (
          // 4. Each card is a link to the corresponding admin page.
          <Link href={section.href} key={section.title}>
            <Card className="hover:border-primary hover:bg-muted/40 transition-colors">
              <CardHeader className="flex flex-row items-center gap-4">
                {section.icon}
                <div>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}