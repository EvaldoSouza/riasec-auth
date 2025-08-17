// All necessary imports are at the top.
"use server";
import Link from "next/link";
import { auth } from "@/lib/auth"; // The server-side Auth.js helper
import { UserNav } from "./userNav"; // Importing a dedicated Client Component for interactivity

// PRINCIPLE 1: A helper function to contain the "intelligence".
// This function cleanly separates the logic for choosing links from the JSX,
// making both easier to read.
const getNavLinksForRole = (role?: 'aplicador' | 'cliente' | string) => {
  // These links are visible to everyone, including logged-out users.
  const baseLinks = [
    { href: "/", label: "Inicio" },
  ];

  // The 'switch' statement is a very clear way to handle role-based logic.
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
      <nav className="container flex items-center justify-between h-14">
        
        {/* SHARED ELEMENT (DRY Principle): The logo is defined once. */}
        <Link href="/" className="font-bold">
          RIASEC 360
        </Link>
        
        {/* DYNAMIC SECTION: The links are rendered from our logic above. */}
        <div className="hidden md:flex items-center space-x-4">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary">
              {link.label}
            </Link>
          ))}
        </div>

        {/* SHARED & COMPOSED ELEMENT (DRY + Composition): The UserNav is defined once. */}
        {/* We pass the session data down to our interactive Client Component. */}
        <UserNav session={session} />
      </nav>
    </header>
  );
}