"use server";

//import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ActionState } from "@/lib/definitions";
import { ApplicationStatus } from "@prisma/client";
import z from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


// This is the shape of the data we'll receive from the client
type AnswerPayload = {
  [cardId: string]: {
    competenceResponse?: string;
    affinityResponse?: string;
  };
};

/**
 * A Server Action to save a user's test progress.
 * It handles the IN_PROGRESS state transition and upserts multiple answers.
 */
export async function saveProgress(
  applicationId: string,
  answers: AnswerPayload
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "Não autorizado." };
  }
  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      // First, ensure this user is part of the application and check its status.
      const userApplication = await tx.userApplication.findUnique({
        where: { userId_applicationId: { userId, applicationId } },
      });

      if (!userApplication) throw new Error("Aplicação não encontrada.");

      // If this is the first time saving progress, update the status.
      if (userApplication.status === ApplicationStatus.NOT_STARTED) {
        await tx.userApplication.update({
          where: { userId_applicationId: { userId, applicationId } },
          data: { status: ApplicationStatus.IN_PROGRESS, testStartedAt: new Date() },
        });
      }

      // Loop through the provided answers and upsert each one.
      for (const cardId in answers) {
        const answer = answers[cardId];
        await tx.answer.upsert({
          where: {
            userApplicationUserId_userApplicationApplicationId_cardId: {
              userApplicationUserId: userId,
              userApplicationApplicationId: applicationId,
              cardId: cardId,
            }
          },
          update: { ...answer },
          create: {
            ...answer,
            cardId,
            userApplicationUserId: userId,
            userApplicationApplicationId: applicationId,
          },
        });
      }
    });
    return { status: "success", message: "Progresso salvo." };
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
    return { status: "error", message: "Não foi possível salvar seu progresso." };
  }
}

const finishTestSchema = z.object({
  applicationId: z.string().cuid({ message: "ID da aplicação inválido." }),
});

export async function finishTest(
  previousState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "Não autorizado." };
  }
  const userId = session.user.id;

  const validatedFields = finishTestSchema.safeParse(Object.fromEntries(formData));
  if (!validatedFields.success) {
    return { status: "error", message: "ID da aplicação inválido." };
  }
  const { applicationId } = validatedFields.data;

  try {
    // A transaction is still a good practice for the validation and update.
    await prisma.$transaction(async (tx) => {
      // 1. Fetch all necessary data for validation.
      const userApplication = await tx.userApplication.findUnique({
        where: { userId_applicationId: { userId, applicationId } },
        include: {
          answers: { select: { cardId: true } }, // We only need the answers to count them
          application: { include: { test: { select: { _count: { select: { cards: true } } } } } },
        },
      });

      if (!userApplication) throw new Error("Aplicação não encontrada.");

      // 2. Final Validation: Ensure all questions have been answered.
      const requiredCardCount = userApplication.application.test._count.cards;
      if (userApplication.answers.length < requiredCardCount) {
        console.log("QUANTOS CARTOES A FUNCAO ACHA QUE TEM", userApplication.answers.length)
        throw new Error("Por favor, responda todas as questões antes de finalizar.");
      }

      // --- REMOVED ---
      // The logic for calculating results and saving to the TestResult table
      // would go here in the future.
      // --- END REMOVED ---

      // 3. Update the UserApplication status to COMPLETED.
      await tx.userApplication.update({
        where: { userId_applicationId: { userId, applicationId } },
        data: {
          status: ApplicationStatus.COMPLETED,
          testFinishedAt: new Date(),
        },
      });
    });
  } catch (error) {
    console.error("Erro ao finalizar o teste:", error);
    return { status: "error", message: error instanceof Error ? error.message : "Não foi possível finalizar o teste." };
  }

  // 4. On success, revalidate and redirect.
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/**
 * A Server Action to delete a single answer for a card, effectively
 * putting it back in the "unanswered" pile for the user.
 */
export async function resetAnswer(
  applicationId: string,
  cardId: string,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { status: "error", message: "Não autorizado." };
  const userId = session.user.id;

  try {
    // Find the specific answer to delete using the composite key.
    await prisma.answer.delete({
      where: {
        userApplicationUserId_userApplicationApplicationId_cardId: {
          userApplicationUserId: userId,
          userApplicationApplicationId: applicationId,
          cardId: cardId,
        }
      },
    });
    // You could also add logic here to revert the UserApplication status
    // from COMPLETED to IN_PROGRESS if necessary.
    return { status: "success", message: "Resposta resetada." };
  } catch (error) {
    // It's okay if this fails (e.g., the answer was already deleted).
    // We can log it but don't need to show a harsh error to the user.
    console.error("Could not reset answer:", error);
    return { status: "error", message: "Não foi possível resetar a resposta." };
  }
}