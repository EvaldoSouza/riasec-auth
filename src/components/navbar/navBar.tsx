"use server";
import Link from "next/link";
import { auth } from "@/lib/auth"; 
import { UserNav } from "./userNav"; 

const getNavLinksForRole = (role?: 'aplicador' | 'cliente' | string) => {

  const baseLinks = [
    { href: "/", label: "Inicio" },
  ];

  switch (role) {
    // For the 'aplicador' role [cite: 95]
    case "APLICADOR":
      return [
        ...baseLinks,
        { href: "/admin", label: "Painel" },
        { href: "/admin/users", label: "Usuários" },
        { href: "/admin/applications", label: "Aplicações" },
        { href: "/admin/tests", label: "Testes" },
        { href: "/admin/cards", label: "Cartões" },
      ];

    // For the 'cliente' role [cite: 95]
    case "CLIENTE":
      return [
        ...baseLinks,
        { href: "/dashboard", label: "Painel" },
        { href: "/dashboard/results", label: "Resultados" },
      ];

    // Default case for logged-out users.
    default:
      return [
        ...baseLinks,
        { href: "/about", label: "Sobre" },
      ];
  }
};

// PRINCIPLE 2: The component is an `async` Server Component.
export async function Navbar() {
  // PRINCIPLE 3: It fetches its own data directly on the server.
  const session = await auth();
  const userRole = session?.user?.role;

  // We call our "intelligent" helper function to get the correct links.
  const navLinks = getNavLinksForRole(userRole);

  // The JSX block defines the structure. Note how much of this is shared.
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95">
      <nav className="flex items-center justify-between w-full h-16 px-10">
        
        <Link href="/" className="font-bold flex-1">
          Vocacione!
        </Link>
        
        {/* DYNAMIC SECTION: The links are rendered from our logic above. */}
        <div className="hidden md:flex items-center space-x-4">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-1 justify-end">
        <UserNav session={session} />

        </div>
      </nav>
    </header>
  );
}