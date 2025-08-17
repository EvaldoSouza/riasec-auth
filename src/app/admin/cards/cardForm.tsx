"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Card } from "@prisma/client"; // Use Prisma types
import { createCard, updateCard } from "@/actions/cardActions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
//import { useToast } from "@/components/ui/use-toast"; // For feedback
import { toast } from "sonner";

// Schema for form validation
const formSchema = z.object({
  pergunta: z.string().min(5),
  tipo: z.enum(["Realista", "Investigativo", "Artístico", "Social", "Empreendedor", "Convencional"]),
});

interface CardFormProps {
  card?: Card; // The optional card prop determines if this is an Edit or Create form
}

export function CardForm({ card }: CardFormProps) {
  const router = useRouter();
  //const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pergunta: card?.question ?? "",
      tipo: card?.riasecType ?? undefined,
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.append('pergunta', values.pergunta);
    formData.append('tipo', values.tipo);

    let result;
    if (card) {
      // EDIT MODE
      formData.append('id_cartao', card.id);
      result = await updateCard(null, formData);
    } else {
      // CREATE MODE
      result = await createCard(null, formData);
    }

    if (result?.error) {
      toast(result.error);
    } else {
      // createCard action redirects on its own. For update, we show a toast.
      if(card) {
        toast("Cartão atualizado com sucesso.");
        router.push('/admin/cards');
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField control={form.control} name="pergunta" render={({ field }) => (/* ...Input for 'pergunta'... */)} />
        <FormField control={form.control} name="tipo" render={({ field }) => (/* ...Select for 'tipo'... */)} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : (card ? "Salvar Alterações" : "Criar Cartão")}
        </Button>
      </form>
    </Form>
  );
}