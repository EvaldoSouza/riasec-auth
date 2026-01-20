"use client";

import { useActionState } from "react"; // Changed from 'react-dom'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerUser } from "./signupAction"; // Fixed typo 'singup' -> 'signup'

export function SignUpForm() {
  // useActionState returns [state, action, isPending]
  const [errorMessage, formAction, isPending] = useActionState(
    registerUser,
    undefined
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">Criar Conta</h1>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-muted-foreground">
            Entrar com e-mail
          </span>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <Input
          name="email"
          placeholder="Email"
          type="email"
          required
          autoComplete="email"
          disabled={isPending} // Best Practice: Disable while loading
        />
        <Input
          name="password"
          placeholder="Password"
          type="password"
          required
          autoComplete="new-password"
          disabled={isPending} // Best Practice: Disable while loading
        />

        {/* Accessibility Best Practice: aria-live ensures screen readers announce the error */}
        {errorMessage && (
          <div 
            aria-live="polite" 
            className="text-sm text-red-500 text-center font-medium"
          >
            {errorMessage}
          </div>
        )}

        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>
    </div>
  );
}