"use client";

import * as React from "react";
import { ColumnDef, useReactTable, getCoreRowModel, getPaginationRowModel } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
// ... you can add imports for filtering/sorting later if needed

interface ParticipantListProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function ParticipantList<TData, TValue>({
  columns,
  data,
}: ParticipantListProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      {/* Add filter/toolbar components here in the future */}
      <DataTable table={table} columns={columns} />
      {/* Add pagination controls here in the future */}
    </div>
  );
}