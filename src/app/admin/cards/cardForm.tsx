"use client";

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
//import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";

// 1. Define and export the enum and schema for reusability and clarity.
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

// 2. Define the component's props. The optional `card` prop is key to its reusability.
interface CardFormProps {
  card?: Card;
}

export function CardForm({ card }: CardFormProps) {
  const router = useRouter();
  const isEditMode = !!card;

  // 3. Safely parse the initial 'tipo' from the database to prevent type errors.
  const validatedInitialTipo = riasecTypes.safeParse(card?.riasecType);
  const initialTipo = validatedInitialTipo.success ? validatedInitialTipo.data : undefined;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pergunta: card?.question ?? "",
      tipo: initialTipo,
    },
  });

  const { isSubmitting } = form.formState;

  // 4. The onSubmit handler determines which server action to call.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true); // 1. Set pending state

    const formData = new FormData();
    formData.append('pergunta', values.pergunta);
    formData.append('tipo', values.tipo);
    
    let result: ActionState | null = null;
    
    if (isEditMode) {
      formData.append('id_cartao', card.id_cartao);
      // 2. Call the server action directly.
      result = await updateCard(formData);
    } else {
      // For create, we can still use the redirecting action.
      // (Or refactor it to return a state object too for consistency).
      await createCard(null, formData);
      // createCard redirects, so the code below won't run in that case.
    }

    setIsSubmitting(false); // 3. Unset pending state

    // 4. Handle the result from the action.
    if (result?.status === 'success') {
      toast({ title: "Sucesso!", description: result.message });
      router.push('/admin/cards');
    } else if (result?.status === 'error') {
      toast({ variant: "destructive", title: "Erro", description: result.message });
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