"use client"; // Needs to be a client component for the interactive parts like DropdownMenu

import { ColumnDef } from "@tanstack/react-table";
import { Test } from "@prisma/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

// This is where you would define your row actions (Edit, Delete, etc.)
function DataTableRowActions({ testId }: { testId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/admin/tests/edit/${testId}`}>Edit Test</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>View Submissions</DropdownMenuItem>
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
    header: "Criado Em",
    cell: ({ row }) => {
      const date = row.getValue<Date>("createdAt");
      return <div className="text-left font-medium">{format(date, "dd/MM/yyyy")}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const test = row.original;
      return <DataTableRowActions testId={test.id} />;
    },
  },
];