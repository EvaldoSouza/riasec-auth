"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table"; // Import our generic, reusable table

// 1. Define the props for this component. It receives the columns definition
//    and the data, which was fetched on the server.
interface CardListProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

/**
 * A client component responsible for managing the state and interactivity
 * of the cards data table.
 */
export function CardList<TData, TValue>({
  columns,
  data,
}: CardListProps<TData, TValue>) {
  // 2. Manage the table's state using React hooks. Here, we manage the state
  //    for the column filters (the search input).
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // 3. Initialize the table instance with the useReactTable hook. This is the
  //    "engine" that powers the table. We pass it our data, columns, and state handlers.
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      {/* 4. The Toolbar: This section contains the interactive elements like filters. */}
      <div className="flex items-center">
        <Input
          placeholder="Filtrar por pergunta..."
          // The filter is specifically bound to the 'question' column.
          value={(table.getColumn("question")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("question")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      
      {/* 5. The generic DataTable component is rendered here. We pass it the `table`
          instance we just created. It handles all the rendering logic. */}
      <DataTable table={table} columns={columns} />
      
      {/* 6. The Pagination Controls: These buttons interact with the table instance
          to change the currently displayed page. */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}