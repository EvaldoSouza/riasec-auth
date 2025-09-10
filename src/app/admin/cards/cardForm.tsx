"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Card } from "@prisma/client";
import { createCard, updateCard } from "@/actions/cardActions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ActionState } from "@/lib/definitions";

// 1. A single, reusable Zod schema defines the validation rules for the form.
const riasecTypes = z.enum([
  "Realista",
  "Investigativo",
  "Artístico",
  "Social",
  "Empreendedor",
  "Convencional",
]);

const formSchema = z.object({
  pergunta: z.string().min(5, { message: "A pergunta deve ter pelo menos 5 caracteres." }),
  tipo: riasecTypes,
});

// 2. The component accepts an optional `card` prop. Its presence determines
//    if the form is for editing an existing card or creating a new one.
interface CardFormProps {
  card?: Card;
}

export function CardForm({ card }: CardFormProps) {
  const router = useRouter();
  const isEditMode = !!card;

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safely parse the initial `tipo` from the database to prevent type errors.
  const validatedInitialTipo = riasecTypes.safeParse(card?.riasecType);
  const initialTipo = validatedInitialTipo.success ? validatedInitialTipo.data : undefined;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pergunta: card?.question ?? "",
      tipo: initialTipo,
    },
  });

  // 3. An explicit onSubmit handler gives us full control over the submission flow.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('pergunta', values.pergunta);
      formData.append('tipo', values.tipo);

      let result: ActionState | null = null;
      
      if (isEditMode) {
        formData.append('id_cartao', card.id);
        result = await updateCard(null, formData);
      } else {
        result = await createCard(null, formData);
      }

      if (result?.status === 'success') {
        toast("Sucesso");
        router.push('/admin/cards');
      } else if (result?.status === 'error') {
        const error_message = "Erro " + result.message
        toast(error_message);
      }
    } catch (error) {
      console.log(error)
      toast("Erro inesperado ao submeter o formulário do cartão");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="pergunta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pergunta</FormLabel>
              <FormControl>
                <Input placeholder="Escreva a pergunta do cartão..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo RIASEC</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {riasecTypes.options.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : (isEditMode ? "Salvar Alterações" : "Criar Cartão")}
        </Button>
      </form>
    </Form>
  );
}