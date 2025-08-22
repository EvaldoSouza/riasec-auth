"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Test } from "@prisma/client";
import Link from "next/link";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// 1. Import the new dialog component.
import { DeleteTestDialog } from "./deleteTestDialog";

/**
 * A self-contained component for rendering the actions dropdown for each row.
 */
function DataTableRowActions({ test }: { test: Test }) {
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
          <Link href={`/admin/tests/edit/${test.id}`}>Editar Teste</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>Ver Aplicações</DropdownMenuItem>
        <DropdownMenuSeparator />

        {/* --- THIS IS THE INTEGRATION --- */}
        {/* 2. We wrap the trigger (the DropdownMenuItem) with our dialog component. */}
        <DeleteTestDialog testId={test.id}>
          {/* 3. The `onSelect` prop prevents the dropdown from closing when this item is clicked,
              allowing the confirmation dialog to open smoothly. */}
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="text-destructive focus:bg-destructive/10"
          >
            Deletar Teste
          </DropdownMenuItem>
        </DeleteTestDialog>
        {/* --- END INTEGRATION --- */}
        
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export const columns: ColumnDef<Test>[] = [
  {
    accessorKey: "description",
    header: "Descrição",
  },
  {
    accessorKey: "cardCount",
    header: "Nº de Cartões",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Criado Em
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    cell: ({ row }) => {
      // Assuming you have date-fns installed
      // import { format } from "date-fns";
      const date = row.getValue<Date>("createdAt");
      return <div className="text-left font-medium">{new Date(date).toLocaleDateString('pt-BR')}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <DataTableRowActions test={row.original} />;
    },
  },
];