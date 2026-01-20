import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignUpForm } from "./signupForm"; // Import Client Component

const Page = async () => {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {/* Render the Client Component */}
      <SignUpForm />

      <div className="text-center">
        <Button asChild variant="link">
          <Link href="/sign-in">Já possui uma conta? Entre aqui.</Link>
        </Button>
      </div>
    </div>
  );
};

export default Page;