// No "use client" needed here.

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@prisma/client"; // 1. Use Prisma's generated type
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<Card>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "question",
    header: "Pergunta",
  },
  {
    accessorKey: "riasecType",
    // 2. Add an interactive, sortable header.
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
    accessorKey: "inUse",
    header: "Em Uso",
    // 3. Use a custom cell renderer to display a user-friendly badge.
    cell: ({ row }) => {
      const emUso = row.getValue("inUse");
      return emUso ? (
        <Badge variant="destructive">Sim</Badge>
      ) : (
        <Badge variant="secondary">Não</Badge>
      );
    },
  },
];