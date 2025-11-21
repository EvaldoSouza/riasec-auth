"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    // 1. Check if it is a specific AuthError
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Email ou senha incorretos.";
        default:
          return "Algo deu errado. Tente novamente.";
      }
    }
    
    // 2. IMPORTANT: Re-throw the error if it's not an AuthError.
    // Next.js uses a specific error to trigger the redirect on success.
    // If you catch it here without re-throwing, the redirect won't happen.
    throw error;
  }
}