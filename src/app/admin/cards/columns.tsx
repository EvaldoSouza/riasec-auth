"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@prisma/client";
import Link from "next/link";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteCardDialog } from "./deleteCardDialog";

/**
 * A self-contained component for rendering the actions dropdown for each row.
 * It provides links for editing and triggers the confirmation dialog for deletion.
 */
function DataTableRowActions({ card }: { card: Card }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/admin/cards/${card.id}/edit`}>Editar Cartão</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        {/*
          Here we use the DeleteCardDialog component. It wraps the trigger
          and contains all the logic for the confirmation modal and for calling
          the server action using the `useActionState` hook.
        */}
        <DeleteCardDialog cardId={card.id}>
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()} // Prevents dropdown from closing on click
            className="text-destructive focus:bg-destructive/10"
          >
            Deletar Cartão
          </DropdownMenuItem>
        </DeleteCardDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export const columns: ColumnDef<Card>[] = [
  {
    accessorKey: "question",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Pergunta
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "riasecType",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tipo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "em_uso",
    header: "Em Uso",
    cell: ({ row }) => {
      const isInUse = row.getValue("em_uso");
      return isInUse ? (
        <Badge variant="outline">Sim</Badge>
      ) : (
        <Badge variant="secondary">Não</Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <DataTableRowActions card={row.original} />;
    },
  },
];