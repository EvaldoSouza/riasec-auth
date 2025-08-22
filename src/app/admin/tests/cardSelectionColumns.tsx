"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<Card>[] = [
  // 1. The "Select" column for checkboxes.
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
  
  // 2. The column for the card's question text.
  {
    accessorKey: "question", 
    header: "Pergunta",
  },

  // 3. The column for the card's RIASEC type, with sorting enabled.
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
  
  // 4. The column to show if the card is already in use by another test.
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
];