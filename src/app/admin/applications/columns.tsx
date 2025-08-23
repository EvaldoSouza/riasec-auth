"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ApplicationWithDetails,
} from "@/services/applicationServices";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { DeleteApplicationDialog } from "./deleteApplicationDialog";

/**
 * Renders the "three dots" action menu for each row.
 */
function DataTableRowActions({
  application,
}: {
  application: ApplicationWithDetails;
}) {
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
          <Link href={`/admin/applications/${application.id}/participants`}>Ver Participantes</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/applications/${application.id}/edit`}>Editar Aplicação</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        <DeleteApplicationDialog applicationId={application.id}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
            Deletar Aplicação
          </DropdownMenuItem>
        </DeleteApplicationDialog>
       
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<ApplicationWithDetails>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Título <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: "test",
    accessorFn: (row) => row.test.description, // Access nested data for sorting/filtering
    header: "Teste",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      // Use different badge variants for a better visual cue.
      const variant: "default" | "secondary" | "outline" = 
        status === 'COMPLETED' ? 'default' : status === 'IN_PROGRESS' ? 'outline' : 'secondary';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: "participants",
    header: "Participantes",
    accessorFn: (row) => row._count.participants, // Access the computed count
    cell: ({ row }) => {
        return <div className="text-center">{row.original._count.participants}</div>
    }
  },
  {
    accessorKey: "availableFrom",
    header: "Agendamento",
    cell: ({ row }) => {
      const availableFrom = row.getValue<Date>("availableFrom");
      // Format the date for Brazilian locale.
      return format(availableFrom, "P p", { locale: ptBR });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <DataTableRowActions application={row.original} />;
    },
  },
];