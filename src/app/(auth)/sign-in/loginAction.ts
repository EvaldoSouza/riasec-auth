"use server";

import { signIn } from "@/lib/auth"; // Ensure this path matches your project structure
import { AuthError } from "next-auth";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    // Convert FormData to a plain object for cleaner handling (optional but recommended)
    // const data = Object.fromEntries(formData); 

    // Attempt to sign in
    // Note: 'redirectTo' is crucial. If not provided, it defaults to the page the user was on.
    // Since you use a basePath, ensure this path exists relative to your domain root.
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/vocacione", // Update this to your actual landing page
    });

  } catch (error) {
    // 1. Handle specific Auth errors (e.g., wrong password)
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Credenciais inválidas. Verifique seu email e senha.";
        case "CallbackRouteError":
          return "Erro ao processar o login. Tente novamente.";
        default:
          return "Algo deu errado. Tente novamente.";
      }
    }

    // 2. CRITICAL: Re-throw the NEXT_REDIRECT error.
    // Next.js throws a special error to handle redirects. 
    // If you catch and return a string here, the redirect will FAIL.
    throw error;
  }
  
  // Explicitly return undefined if success (though code usually won't reach here due to redirect)
  return undefined;
}