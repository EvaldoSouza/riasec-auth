"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteTest } from "@/actions/testActions";
//import { ActionState } from "@/lib/definitions";
import { toast } from "sonner";
import React from "react";

/**
 * A helper component to manage the submit button's pending state,
 * showing a "Deleting..." message during the server action.
 */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction type="submit" disabled={pending}>
      {pending ? "Excluindo..." : "Continuar"}
    </AlertDialogAction>
  );
}

interface DeleteTestDialogProps {
  testId: string;
  children: React.ReactNode; // The trigger, e.g., a <DropdownMenuItem>
}

/**
 * A client component that provides a confirmation dialog before deleting a test.
 * It uses a form and a server action to perform the deletion.
 */
export function DeleteTestDialog({ testId, children }: DeleteTestDialogProps) {
  // 1. We use the `useActionState` hook to bind our `deleteTest` server action
  //    to the form's state. The `state` variable will hold the result.
  const [state, formAction] = useActionState(deleteTest, null);

  // 2. We use `useEffect` to show a toast notification as a side-effect
  //    when the server action returns a result.
  useEffect(() => {
    if (state?.status === 'success') {
      toast.success(state.message);
    } else if (state?.status === 'error') {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso irá excluir permanentemente o teste.
            Se houver aplicações de usuários vinculadas, a exclusão será impedida.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          {/* 3. The form calls the `formAction` from our hook when submitted. */}
          <form action={formAction}>
            {/* We pass the test's ID using a hidden input field. */}
            <input type="hidden" name="testId" value={testId} />
            <SubmitButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}