"use client";

import * as React from "react";
import { useActionState } from "react";
import { useReactTable, getCoreRowModel, RowSelectionState } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table"; // Our reusable DataTable
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@prisma/client";
import { useFormStatus } from "react-dom";
import { createTest } from "@/actions/testActions";
import {columns} from "../cardSelectionColumns"

// This is a helper component for the submit button's pending state
function SubmitButton() {
  const { pending } = useFormStatus(); // A hook from react-dom
  return <Button type="submit" disabled={pending}>{pending ? "Salvando..." : "Salvar Teste"}</Button>;
}

export function CreateTestForm({ cards }: { cards: Card[] }) {
  // 1. Manage the state for which rows are selected in the table.
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  
  // 2. We use our `createTest` server action with the `useActionState` hook for feedback.
  const [state, formAction] = useActionState(createTest, null);
  
  // The table instance, now with row selection enabled.
  const table = useReactTable({
    data: cards,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection, // Enable and manage row selection
    state: {
      rowSelection,
    },
  });

  // Get the original card objects for the selected rows.
  const selectedCards = table.getFilteredSelectedRowModel().rows.map(row => row.original);
  // Get just the IDs of the selected cards.
  const selectedCardIds = selectedCards.map(card => card.id);

  return (
    // 3. The form wraps the entire interface.
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="description" className="text-lg font-semibold">Nome do Teste</label>
        <Input 
          id="description"
          name="description" 
          placeholder="Ex: Teste Vocacional Completo 2025" 
          required 
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Selecione os Cartões</h2>
        <p className="text-sm text-muted-foreground">
          Selecione todos os cartões que farão parte deste teste. Selecionados: {selectedCardIds.length}
        </p>
        <DataTable table={table} columns={columns} />
      </div>

      {/* 4. A hidden input to pass the selected card IDs to the server action. */}
      <input type="hidden" name="cardIds" value={selectedCardIds.join(',')} />
      
      <div className="flex justify-end">
        <SubmitButton />
      </div>
      
      {state?.status === 'error' && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
    </form>
  );
}