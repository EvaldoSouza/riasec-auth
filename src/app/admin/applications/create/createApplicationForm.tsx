"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useReactTable, getCoreRowModel, RowSelectionState } from "@tanstack/react-table";
import { Test, User } from "@prisma/client";
import { createApplication } from "@/actions/applicationActions";
import { columns as userSelectionColumns } from "./userSelectionColumns";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/datetime-picker";

// 1. A comprehensive Zod schema for client-side validation.
const formSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres." }),
  testId: z.string({ required_error: "Por favor, selecione um teste." }),
  availableFrom: z.date({ required_error: "A data de início é obrigatória." }),
  availableUntil: z.date().optional(),
  durationInMinutes: z.number().positive().optional(),
}).refine(data => {
  // Ensure 'availableUntil' is after 'availableFrom' if it exists.
   if (data.availableFrom && data.availableUntil) {
    // Return `true` if the end date is on or after the start date (validation passes).
    return data.availableUntil >= data.availableFrom;
  }
  // If no end date is set, the validation automatically passes.
  return true;
}, {
  message: "A data final deve ser posterior à data de início.",
  path: ["availableUntil"], // Associate the error with the end date field.
});

// Helper component for the submit button's pending state.
function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Agendando..." : "Agendar Aplicação"}</Button>;
}

interface CreateApplicationFormProps {
  tests: Test[];
  users: User[];
}

export function CreateApplicationForm({ tests, users }: CreateApplicationFormProps) {
  const router = useRouter();
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  
  const table = useReactTable({
    data: users,
    columns: userSelectionColumns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  });
  
  const selectedUserIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);

  // 3. react-hook-form manages the state of our complex form fields.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "", // Initialize text inputs with an empty string instead of undefined
      testId: undefined, // `undefined` is fine for <Select> and <DateTimePicker> placeholders
      availableFrom: undefined,
      availableUntil: undefined,
      durationInMinutes: undefined,
    },
  });

   async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    // Append all form values to formData
    formData.append('title', values.title);
    formData.append('testId', values.testId);
    formData.append('availableFrom', values.availableFrom.toISOString());
    if (values.availableUntil) {
      formData.append('availableUntil', values.availableUntil.toISOString());
    }
    if (values.durationInMinutes) {
      formData.append('durationInMinutes', values.durationInMinutes.toString());
    }
    formData.append('userIds', selectedUserIds.join(','));

    // Call the server action.
    const result = await createApplication(null, formData);

    // Handle the result with toasts and navigation.
    if (result.status === 'success') {
      toast.success(result.message);
      router.push('/admin/applications');
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Form {...form}>
      {/* 5. The form's action prop calls our server action. */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Column 1: Application Details */}
          <div className="space-y-6">
            <FormField control={form.control} name="title" render={({ field }) => <FormItem><FormLabel>Título da Aplicação</FormLabel><FormControl><Input placeholder="Avaliação Turma A..." {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="testId" render={({ field }) => <FormItem><FormLabel>Selecione o Teste</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Selecione um teste para aplicar" /></SelectTrigger></FormControl><SelectContent>{tests.map(test => (<SelectItem key={test.id} value={test.id}>{test.description}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>} />
            <FormField control={form.control} name="availableFrom" render={({ field }) => <FormItem className="flex flex-col"><FormLabel>Disponível a partir de</FormLabel><DateTimePicker date={field.value} setDate={field.onChange} /><FormMessage /></FormItem>} />
            <FormField control={form.control} name="availableUntil" render={({ field }) => <FormItem className="flex flex-col"><FormLabel>Disponível até (Opcional)</FormLabel><DateTimePicker date={field.value} setDate={field.onChange} /><FormMessage /></FormItem>} />
            <FormField control={form.control} name="durationInMinutes" render={({ field }) => <FormItem><FormLabel>Duração em Minutos (Opcional)</FormLabel><FormControl><Input 
                      type="number" 
                      placeholder="Ex: 60" 
                      {...field} 
                      value={field.value ?? ''}
                      // We also need a custom onChange to handle the empty string case
                      onChange={e => {
                        const value = e.target.value;
                        // When the user clears the input, we set the value to undefined,
                        // which matches our Zod schema's `.optional()` type.
                        field.onChange(value === '' ? undefined : parseInt(value, 10));
                      }}
                    /></FormControl><FormMessage /></FormItem>} />
          </div>
          
          {/* Column 2: User Selection Table */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Selecione os Participantes</h3>
            <p className="text-sm text-muted-foreground">Selecionados: {selectedUserIds.length}</p>
            <DataTable table={table} columns={userSelectionColumns} />
          </div>
        </div>

        {/* 6. Hidden inputs pass data that isn't a direct form field to the action. */}
        <input type="hidden" name="userIds" value={selectedUserIds.join(',')} />
        
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </Form>
  );
}