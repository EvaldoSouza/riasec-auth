"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Schema for creating and updating a card
const cardSchema = z.object({
  pergunta: z.string().min(5, { message: "A pergunta deve ter pelo menos 5 caracteres." }),
  tipo: z.enum(["Realista", "Investigativo", "Artístico", "Social", "Empreendedor", "Convencional"]),
});

type FormState = { error?: string; success?: string; } | null;

//card update stuff
//TODO later check if the updateCardSchema is really needed
export type ActionState = {
  status: "success" | "error";
  message: string;
};

const updateCardSchema = z.object({
  id_cartao: z.string(),
  pergunta: z.string().min(5, { message: "A pergunta deve ter pelo menos 5 caracteres." }),
  tipo: z.enum(["Realista", "Investigativo", "Artístico", "Social", "Empreendedor", "Convencional"]),
});

// --- CREATE ACTION ---
export async function createCard(previousState: FormState, formData: FormData): Promise<FormState> {
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') return { error: "Não autorizado." };
  
  const validatedFields = cardSchema.safeParse(Object.fromEntries(formData));
  if (!validatedFields.success) {
    return { error: "Dados inválidos. Por favor, verifique os campos." };
  }

  try {
    await prisma.card.create({ data: validatedFields.data });
  } catch (error) {
    console.log(error)
    return { error: "Erro no banco de dados: Não foi possível criar o cartão." };
  }
  
  revalidatePath("/admin/cards");
  redirect("/admin/cards");
}

// --- UPDATE ACTION ---
export async function updateCard(formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') {
    return { status: "error", message: "Não autorizado." };
  }

  const validatedFields = updateCardSchema.safeParse(Object.fromEntries(formData));
  if (!validatedFields.success) {
    return { status: "error", message: "Dados inválidos. Por favor, verifique os campos." };
  }
  
  const { id_cartao, pergunta, tipo } = validatedFields.data;
  
  try {
    // 1. First, check if the card is in use, just like in your prototype.
    const existingAnswer = await prisma.answer.findFirst({
      where: { cardId: id_cartao },
    });
    
    // If it has been answered, prevent the edit and return a specific error.
    if (existingAnswer) {
      return { status: 'error', message: 'Este cartão não pode ser editado pois já foi respondido em um teste.' };
    }
    
    // 2. If it's not in use, proceed with the update.
    await prisma.card.update({
      where: { id: id_cartao },
      data: { question: pergunta, riasecType: tipo },
    });

    revalidatePath("/admin/cards");
    return { status: "success", message: "Cartão atualizado com sucesso!" };

  } catch (error) {
    console.error("Erro ao atualizar o cartão:", error);
    return { status: "error", message: "Erro no banco de dados: Não foi possível atualizar o cartão." };
  }
}

// --- DELETE ACTION ---
export async function deleteCard(previousState: FormState, formData: FormData): Promise<FormState> {
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') return { error: "Não autorizado." };

  const id = formData.get('id_cartao') as string;
  if (!id) return { error: "ID do cartão não encontrado." };
  
  try {
    const card = await prisma.card.findUnique({ where: { id: id } });
    if (card?.inUse) {
      return { error: "Este cartão não pode ser excluído pois está em uso por um teste." };
    }
    await prisma.card.delete({ where: { id: id } });
    revalidatePath("/admin/cards");
    return { success: "Cartão excluído com sucesso." };
  } catch (error) {
    console.log(error)
    return { error: "Erro no banco de dados: Não foi possível excluir o cartão." };
  }
}