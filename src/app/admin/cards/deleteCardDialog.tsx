"use client";

import { useActionState, useEffect } from "react";
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
import { deleteCard } from "@/actions/cardActions";
import { toast } from "sonner";
import { useFormStatus } from "react-dom";
import React from "react";

// A helper component to manage the submission button's pending state
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction type="submit" disabled={pending}>
      {pending ? "Excluindo..." : "Continuar"}
    </AlertDialogAction>
  );
}

interface DeleteCardDialogProps {
  cardId: string;
  children: React.ReactNode; // The trigger, e.g., a <DropdownMenuItem>
}

export function DeleteCardDialog({ cardId, children }: DeleteCardDialogProps) {
  // 1. Use the `useActionState` hook to bind our server action to the form's state.
  //    The `state` variable will hold the `{ status, message }` object returned by the action.
  const [state, formAction] = useActionState(deleteCard, null);

  // 2. Use `useEffect` to trigger side-effects (like a toast) when the action completes.
  useEffect(() => {
    if (state?.status === 'success') {
      toast.success(state.message);
    } else if (state?.status === 'error') {
      toast.error(state.message);
    }
  }, [state]); // This effect runs whenever the `state` changes.

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso irá excluir permanentemente o cartão do banco de dados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          {/* 3. The form calls the `formAction` from our hook when submitted. */}
          <form action={formAction}>
            {/* We pass the card's ID using a hidden input field. */}
            <input type="hidden" name="id_cartao" value={cardId} />
            <SubmitButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}