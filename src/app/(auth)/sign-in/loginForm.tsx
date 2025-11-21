"use client";

import { useFormState } from "react-dom"; // or 'react' in newer versions
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authenticate } from "./loginAction"; // Import the action we created above

export function LoginForm() {
  // errorMessage will hold the string returned by the action
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  return (
    <form action={dispatch} className="space-y-4">
      <div className="text-lg text-center">Entre para Começar</div>

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
        autoComplete="current-password"
      />

      {/* 👇 Display the error message here if it exists */}
      {errorMessage && (
        <div className="text-sm text-red-500 text-center font-medium">
          {errorMessage}
        </div>
      )}

      <Button className="w-full" type="submit">
        Entrar
      </Button>
    </form>
  );
}