"use client";

import { useFormStatus } from "react-dom";
import { changePassword } from "@/services/userSettings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useActionState } from "react";

function ChangePasswordSubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Alterando..." : "Alterar Senha"}</Button>;
}

export function PasswordForm() {
  const [state, formAction] = useActionState(changePassword, null);
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="currentPassword">Senha Atual</label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="newPassword">Nova Senha</label>
        <Input id="newPassword" name="newPassword" type="password" required />
      </div>
      <ChangePasswordSubmitButton />
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-500">{state.success}</p>}
    </form>
  );
}