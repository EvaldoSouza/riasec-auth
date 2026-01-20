"use server";

import { signUp } from "@/lib/actions"; 
import { redirect } from "next/navigation";

export async function registerUser(
  prevState: string | undefined,
  formData: FormData
) {
  // 1. Logic Layer
  // We use a variable or simply return early on failure to control flow
  try {
    const res = await signUp(formData);

    // If logic fails (e.g., email exists), return the error immediately.
    // This keeps us inside the function but stops us from reaching the redirect.
    if (!res.success) {
      return res.error || "Erro ao criar conta.";
    }

  } catch (error) {
    // If a database crash occurs, we catch it here.
    console.error("Signup System Error:", error);
    return "Ocorreu um erro inesperado. Tente novamente.";
  }

  // 2. Redirect Layer (Outside Try/Catch)
  // If we reached this line, it means no errors were thrown 
  // and no failure messages were returned.
  redirect("/sign-in");
}