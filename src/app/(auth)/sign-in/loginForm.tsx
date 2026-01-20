"use client";

import { useActionState } from "react"; // Updated from 'react-dom' logic
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authenticate } from "./loginAction";

export function LoginForm() {
  // useActionState returns: [state, actionFunction, isPendingBoolean]
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="text-lg text-center">Entre para Começar</div>

      <Input
        name="email"
        placeholder="Email"
        type="email"
        required
        autoComplete="email"
        // Disable input while submitting to prevent data race conditions
        disabled={isPending} 
      />
      
      <Input
        name="password"
        placeholder="Password"
        type="password"
        required
        autoComplete="current-password"
        disabled={isPending}
      />

      {/* Error Message Display */}
      {errorMessage && (
        <div 
          aria-live="polite" 
          className="text-sm text-red-500 text-center font-medium"
        >
          {errorMessage}
        </div>
      )}

      {/* Button with Loading State */}
      <Button 
        className="w-full" 
        type="submit" 
        disabled={isPending}
      >
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}