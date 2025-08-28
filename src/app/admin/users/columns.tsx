"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserWithApplicationCount } from "@/services/userServices";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

/**
 * Renders the "three dots" action menu for each user row.
 */
function DataTableRowActions({ user }: { user: UserWithApplicationCount }) {
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
          <Link href={`/admin/users/${user.id}/results`}>Ver Resultados do Teste</Link>
        </DropdownMenuItem>
        {/* We can add more actions like 'Change Role' or 'Deactivate' here in the future */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<UserWithApplicationCount>[] = [
  // Column for the user's name, with sorting
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nome <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  // Column for the user's email
  {
    accessorKey: "email",
    header: "Email",
  },
  // Column for the user's role, displayed as a badge
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const variant = role === 'APLICADOR' ? 'default' : 'secondary';
      return <Badge variant={variant}>{role}</Badge>;
    },
  },
  // A computed column to show the number of completed tests
  {
    id: "completedTests",
    header: "Testes Concluídos",
    accessorFn: (row) => row._count.applications,
    cell: ({ row }) => {
      return <div className="text-center">{row.original._count.applications}</div>;
    },
  },
  // Column for the user's registration date, with formatting and sorting
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Registrado Em <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue<Date>("createdAt");
      return <div className="font-medium">{new Date(date).toLocaleDateString('pt-BR')}</div>;
    },
  },
  // The column for row-specific actions
  {
    id: "actions",
    cell: ({ row }) => {
      return <DataTableRowActions user={row.original} />;
    },
  },
];