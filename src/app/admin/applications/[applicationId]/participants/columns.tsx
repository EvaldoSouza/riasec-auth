"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ApplicationWithParticipants } from "@/services/applicationServices";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

// The data type for each row, derived from our service function's return type.
type Participant = ApplicationWithParticipants['participants'][0];

export const columns: ColumnDef<Participant>[] = [
  
  {
    // --- THIS IS THE FIX ---
    id: 'userName', // A unique ID is required when using accessorFn
    // --- END FIX ---
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nome <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    accessorFn: (row) => row.user.name,
  },
  {
    // --- THIS IS THE FIX ---
    id: 'userEmail', // A unique ID is required when using accessorFn
    // --- END FIX ---
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Email <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    accessorFn: (row) => row.user.email,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant: "default" | "secondary" | "outline" = 
        status === 'COMPLETED' ? 'default' : status === 'IN_PROGRESS' ? 'outline' : 'secondary';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "testStartedAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Iniciado Em
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue<Date | null>("testStartedAt");
      // Formats the date to a readable format, e.g., "23 de ago. de 2025 08:45"
      return date ? format(date, "P p", { locale: ptBR }) : "—";
    },
  },
  {
    accessorKey: "testFinishedAt",
    // --- THIS IS THE CHANGE ---
    // The header is now an interactive button to enable sorting for this column.
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Finalizado Em
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    // --- END CHANGE ---
    cell: ({ row }) => {
      const date = row.getValue<Date | null>("testFinishedAt");
      return date ? format(date, "P p", { locale: ptBR }) : "—";
    },
  },
];