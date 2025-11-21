import Link from "next/link";
import { type Session } from "next-auth"; // Import the Session type for props
import { Button } from "@/components/ui/button"; // Assuming you use shadcn/ui

// Define the props for the component. It expects to receive the user's session.
interface HeroSectionProps {
  session: Session | null;
}

export function HeroSection({ session }: HeroSectionProps) {
  return (
    <section className="text-center py-20 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Optional: A small "eyebrow" text to warm up the user */}
        <p className="text-primary font-semibold">Modelo RIASEC</p>
        
        {/* 1. The Headline (h1) */}
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Encontre a Carreira Ideal Para Sua Personalidade
        </h1>
        
        {/* 2. The Sub-headline */}
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          Utilize o modelo RIASEC para descobrir seus interesses e explorar 
          profissões compatíveis com o seu perfil.
        </p>
        
        {/* 3. The Dynamic Call to Action (CTA) */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {session ? (
            // --- CTA for LOGGED-IN users ---
            <div className="text-center">
              <p className="text-muted-foreground">
                Bem-vindo(a) de volta, {session.user?.name}!
              </p>
              <Button asChild className="mt-2">
                <Link href="/dashboard">Acessar seu Painel</Link>
              </Button>
            </div>
          ) : (
            // --- CTA for LOGGED-OUT users ---
            <>
              <Button asChild size="lg">
                <Link href="/testes">Criar uma conta</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/sign-in">Já tenho uma conta</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}