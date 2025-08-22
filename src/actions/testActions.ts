"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ActionState } from "@/lib/definitions";
import { auth } from "@/lib/auth";

const createTestSchema = z.object({
  description: z.string().min(3, { message: "A descrição deve ter pelo menos 3 caracteres." }),
  cardIds: z.string().min(1, { message: "Você deve selecionar pelo menos um cartão." }),
});

const deleteTestSchema = z.object({
  testId: z.string().cuid({ message: "ID do teste inválido." }),
});


export async function createTest(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  
    
    const session = await auth();
    // 1. Security: Ensure the user is an administrator.
    if (session?.user?.role !== 'APLICADOR') {
      return { status: "error", message: "Não autorizado." };
    }
    const validatedFields = createTestSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return { status: "error", message: firstError ?? "Dados inválidos." };
  }

  const { description } = validatedFields.data;
  const cardIds = validatedFields.data.cardIds.split(',');
  
  try {
    await prisma.$transaction(async (tx) => {
     
      await tx.test.create({
        data: {
          description: description,
          // 2. Use the relation field name `cards` for the nested write.
          cards: {
            createMany: {
              // 3. Map to the correct `cardId` field from the `TestCard` model.
              data: cardIds.map((id) => ({ cardId: id })),
            },
          },
        },
      });

      await tx.card.updateMany({
        where: {
          id: { in: cardIds },
        },
        data: {
          inUse: true,
        },
      });
    });
  } catch (error) {
    console.error("Erro ao criar o teste:", error);
    return { status: "error", message: "Falha ao criar o teste. Por favor, tente novamente." };
  }

  revalidatePath("/admin/tests");
  redirect("/admin/tests");
}

/**
 * A Server Action to delete a Test.
 * It first checks if the test has any associated applications before deleting.
 * @param previousState - The previous state from `useActionState`.
 * @param formData - The data submitted from the form, containing the test ID.
 */
export async function deleteTest(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  // 1. Security: Ensure the user is an administrator.
  if (session?.user?.role !== 'APLICADOR') {
    return { status: "error", message: "Não autorizado." };
  }

  // 2. Validation: Ensure the form data contains a valid test ID.
  const validatedFields = deleteTestSchema.safeParse({
    testId: formData.get("testId"),
  });

  if (!validatedFields.success) {
    return { status: "error", message: "ID do teste inválido." };
  }
  const { testId } = validatedFields.data;
  
  try {
    // We now wrap the entire, more complex logic in a transaction.
    await prisma.$transaction(async (tx) => {
      
      // 1. First, find all the Card IDs associated with the Test we are about to delete.
      const testCards = await tx.testCard.findMany({
        where: { testId: testId },
        select: { cardId: true },
      });
      const cardIdsInTest = testCards.map(tc => tc.cardId);

      // (Optional Safety Check): Check for existing applications before doing anything.
      const existingApplication = await tx.application.findFirst({
        where: { testId: testId },
      });
      if (existingApplication) {
        // By throwing an error here, we cause the entire transaction to fail and roll back.
        throw new Error("Este teste não pode ser excluído pois já foi respondido por usuários.");
      }

      // 2. Delete the test. Prisma's `onDelete: Cascade` will automatically delete
      //    the `TestCard` join table records.
      await tx.test.delete({
        where: { id: testId },
      });

      // 3. Find which of the cards from the deleted test are now "orphaned" (i.e., not
      //    linked to ANY other test).
      const remainingLinks = await tx.testCard.findMany({
        where: { cardId: { in: cardIdsInTest } },
        select: { cardId: true }
      });
      const stillInUseCardIds = new Set(remainingLinks.map(link => link.cardId));
      const cardsToUpdate = cardIdsInTest.filter(id => !stillInUseCardIds.has(id));

      // 4. If there are any cards that are now free, update their status in a single batch.
      if (cardsToUpdate.length > 0) {
        await tx.card.updateMany({
          where: {
            id: { in: cardsToUpdate },
          },
          data: {
            inUse: false,
          },
        });
      }
    });

    revalidatePath("/admin/tests");
    return { status: "success", message: "Teste excluído com sucesso e status dos cartões atualizado." };

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Erro ao excluir o teste:", error.message);
      if (error.message.includes("já foi respondido por usuários")) {
          return { status: "error", message: error.message };
      }
    } else {
      console.error("Um erro inesperado ocorreu:", error);
    }
        
    return { status: "error", message: "Falha ao excluir o teste. Por favor, tente novamente." };
  
  }
}