import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./loginForm"; // Import the client component

const Page = async () => {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {/* Render the Client Component containing the form logic */}
      <LoginForm />

      <div className="text-center">
        <Button asChild variant="link" className="text-lg">
          <Link href="/sign-up">Não tem uma conta? Cadastre-se aqui.</Link>
        </Button>
      </div>
    </div>
  );
};

export default Page;