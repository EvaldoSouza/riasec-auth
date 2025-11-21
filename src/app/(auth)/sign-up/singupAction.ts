"use server";

import { signUp } from "@/lib/actions"; // Your existing logic
import { redirect } from "next/navigation";

export async function registerUser(
  prevState: string | undefined,
  formData: FormData
) {
  // Call your existing logic function
  const res = await signUp(formData);

  if (res.success) {
    // If successful, redirect to sign-in page
    redirect("/sign-in");
  } else {
    // If failed, return the error message to be displayed
    return res.error || "Erro ao criar conta. Tente novamente.";
  }
}