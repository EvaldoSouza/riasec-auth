"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ApplicationWithParticipants } from "@/services/applicationServices";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// The data type for each row is one of the `participants` from our detailed query.
type Participant = ApplicationWithParticipants['participants'][0];

export const columns: ColumnDef<Participant>[] = [
  {
    header: "Nome",
    accessorFn: (row) => row.user.name, // Access nested data
  },
  {
    header: "Email",
    accessorFn: (row) => row.user.email,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant: "default" | "secondary" | "outline" = 
        status === 'COMPLETED' ? 'default' : status === 'IN_PROGRESS' ? 'outline' : 'secondary';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "testStartedAt",
    header: "Iniciado Em",
    cell: ({ row }) => {
      const date = row.getValue<Date | null>("testStartedAt");
      return date ? format(date, "P p", { locale: ptBR }) : "—";
    },
  },
  {
    accessorKey: "testFinishedAt",
    header: "Finalizado Em",
    cell: ({ row }) => {
      const date = row.getValue<Date | null>("testFinishedAt");
      return date ? format(date, "P p", { locale: ptBR }) : "—";
    },
  },
];