"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserWithApplicationCount } from "@/services/userServices";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserRowActions } from "./userRowActions"; // Import our new component

export const columns: ColumnDef<UserWithApplicationCount>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nome <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Permissão",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      // Visual feedback for Admins vs Users
      return (
        <Badge variant={role === 'APLICADOR' ? 'default' : 'secondary'}>
          {role === 'APLICADOR' ? 'Admin' : 'Cliente'}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive", // Optional: Visual indicator if they are active
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <div className={`flex items-center gap-2 ${isActive ? 'text-green-600' : 'text-red-500'}`}>
           <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
           <span className="text-xs font-medium">{isActive ? 'Ativo' : 'Inativo'}</span>
        </div>
      );
    }
  },
  {
    id: "completedTests",
    header: "Testes",
    accessorFn: (row) => row._count.applications,
    cell: ({ row }) => (
      <div className="text-center font-mono">{row.original._count.applications}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Data Registro <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue<Date>("createdAt");
      return <div className="text-muted-foreground">{new Date(date).toLocaleDateString('pt-BR')}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <UserRowActions user={row.original} />,
  },
];