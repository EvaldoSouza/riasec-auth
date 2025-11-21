"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ActionState } from "@/lib/definitions"; // 1. Import the shared ActionState type


// Schema for creating and updating a card
const cardSchema = z.object({
  pergunta: z.string().min(5, { message: "A pergunta deve ter pelo menos 5 caracteres." }),
  tipo: z.enum(["Realista", "Investigativo", "Artístico", "Social", "Empreendedor", "Convencional"]),
});

const updateCardSchema = z.object({
  id_cartao: z.string(),
  pergunta: z.string().min(5, { message: "A pergunta deve ter pelo menos 5 caracteres." }),
  tipo: z.enum(["Realista", "Investigativo", "Artístico", "Social", "Empreendedor", "Convencional"]),
});

// A simple schema to validate that the card ID is present.
const deleteCardSchema = z.object({
  id_cartao: z.string().min(1, { message: "Card ID is required." }),
});

// --- CREATE ACTION ---
export async function createCard(previousState: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (session?.user?.role !== 'APLICADOR') {
    return { status: "error", message: "Não autorizado." };
  }
  
  const validatedFields = cardSchema.safeParse(Object.fromEntries(formData));
  if (!validatedFields.success) {
    return { status: "error", message: "Dados inválidos. Por favor, verifique os campos." };
  }

  try {
    await prisma.card.create({
      data: {
        question: validatedFields.data.pergunta,
        riasecType: validatedFields.data.tipo,
      },
    });
  } catch (error) {
    console.error("Erro ao criar o cartão:", error);
    return { status: "error", message: "Erro no banco de dados: Não foi possível criar o cartão." };
  }
  
  // revalidate the cache to ensure the list page will show the new data.
  revalidatePath("/admin/cards");
  return { status: "success", message: "Cartão criado com sucesso!" };
}

// --- UPDATE ACTION ---
export async function updateCard(previousState: ActionState | null, formData: FormData): Promise<ActionState> {
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

/**
 * A Server Action to delete a card.
 * It checks if the card is in use before deleting.
 * @param previousState - The previous state from `useActionState`.
 * @param formData - The data submitted from the form, containing the card ID.
 */
export async function deleteCard(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  // Security: Ensure the user is an administrator.
  if (session?.user?.role !== 'APLICADOR') {
    return { status: "error", message: "Não autorizado." };
  }

  // Validation: Ensure the form data is valid.
  const validatedFields = deleteCardSchema.safeParse(Object.fromEntries(formData));
  if (!validatedFields.success) {
    return { status: "error", message: "ID do cartão inválido." };
  }

  const { id_cartao } = validatedFields.data;
  
  try {
    // Business Logic: Check if the card is currently in use by a test.
    const card = await prisma.card.findUnique({
      where: { id: id_cartao },
    });

    if (!card) {
      return { status: "error", message: "Cartão não encontrado." };
    }
    
    if (card.inUse) {
      return { status: "error", message: "Este cartão não pode ser excluído pois está em uso por um teste." };
    }

    // Database Mutation: If all checks pass, delete the card.
    await prisma.card.delete({
      where: { id: id_cartao },
    });

    // Side Effect: Revalidate the cache for the cards list page.
    revalidatePath("/admin/cards");
    
    return { status: "success", message: "Cartão excluído com sucesso." };

  } catch (error) {
    console.error("Erro ao excluir o cartão:", error);
    return { status: "error", message: "Erro no banco de dados: Não foi possível excluir o cartão." };
  }
}