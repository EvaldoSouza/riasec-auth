"use client";

import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerUser } from "./singupAction"; // Import the action from Step 1

export function SignUpForm() {
  const [errorMessage, dispatch] = useFormState(registerUser, undefined);

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

      <form action={dispatch} className="space-y-4">
        <Input
          name="email"
          placeholder="Email"
          type="email"
          required
          autoComplete="email"
        />
        <Input
          name="password"
          placeholder="Password"
          type="password"
          required
          autoComplete="new-password"
        />

        {/* Display Error Message */}
        {errorMessage && (
          <div className="text-sm text-red-500 text-center font-medium">
            {errorMessage}
          </div>
        )}

        <Button className="w-full" type="submit">
          Cadastrar
        </Button>
      </form>
    </div>
  );
}