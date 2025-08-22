"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useReactTable, getCoreRowModel, RowSelectionState } from "@tanstack/react-table";
import { columns } from "../../cardSelectionColumns"; // The columns for selecting cards
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateTest } from "@/actions/testActions";
import { Card, Test, TestCard } from "@prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Helper component for the submit button's pending state
function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Salvando..." : "Salvar Alterações"}</Button>;
}

// 1. Define the shape of the props, which includes the test being edited
//    and a list of all cards available for selection.
interface EditTestFormProps {
  test: Test & { cards: Pick<TestCard, 'cardId'>[] };
  allCards: Card[];
}

export function EditTestForm({ test, allCards }: EditTestFormProps) {
  const initialRowSelection = React.useMemo(() => {
    const selectedCardIds = new Set(test.cards.map(c => c.cardId));
    const selection: RowSelectionState = {};
    allCards.forEach((card, index) => {
      if (selectedCardIds.has(card.id)) {
        selection[index] = true;
      }
    });
    return selection;
  }, [test.cards, allCards]);

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(initialRowSelection);
  const [state, formAction] = useActionState(updateTest, null);

  const table = useReactTable({
    data: allCards,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  // Get the IDs of the currently selected cards from the table state.
  const selectedCardIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
  const router = useRouter()
  
  // 3. Use useEffect to show a toast message when the server action completes.
  useEffect(() => {
    if (state?.status === 'success') {
      toast.success(state.message);
      router.push('/admin/tests')
    } else if (state?.status === 'error') {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      {/* 4. Use hidden inputs to pass essential data to the server action. */}
      <input type="hidden" name="testId" value={test.id} />
      <input type="hidden" name="cardIds" value={selectedCardIds.join(',')} />
      
      <div className="space-y-2">
        <label htmlFor="description" className="text-lg font-semibold">Nome do Teste</label>
        <Input 
          id="description"
          name="description" 
          defaultValue={test.description ?? ""}
          required 
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Selecione os Cartões</h2>
        <p className="text-sm text-muted-foreground">
          Marque ou desmarque os cartões para alterar a composição do teste. Selecionados: {selectedCardIds.length}
        </p>
        <DataTable table={table} columns={columns} />
      </div>
      
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}