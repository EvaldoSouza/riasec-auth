"use server";

//import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ActionState } from "@/lib/definitions";
import { ApplicationStatus } from "@prisma/client";
import z from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculateRiasecFromResponses } from "@/lib/riasecCalculator";


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
    // 2. We use a transaction to ensure all final database updates are atomic.
    await prisma.$transaction(async (tx) => {
      // First, fetch all the data we need in one comprehensive query.
      const userApplication = await tx.userApplication.findUnique({
        where: { userId_applicationId: { userId, applicationId } },
        include: {
          // We need the answers with their related cards for the calculator.
          answers: {
            include: {
              card: true,
            },
          },
          // We need to know the total number of cards in the test for validation.
          application: {
            include: {
              test: {
                include: {
                  _count: {
                  select: { cards: true }, // Assumes the relation is named 'cards'
                },
                },
              },
            },
          },
        },
      });

      if (!userApplication) throw new Error("Aplicação não encontrada.");

      // 4. Call our calculation service to get the final result.
      const calculatedResult = calculateRiasecFromResponses(userApplication.answers);

      // 5. Save the final result to the TestResult table.
      // We use `upsert` to be robust in case this action is ever re-run.
      await tx.testResult.upsert({
        where: { userId_applicationId: { userId, applicationId } },
        update: {
          riasecCode: calculatedResult.riasecCode,
          scores: calculatedResult.scores,
        },
        create: {
          userId,
          applicationId,
          riasecCode: calculatedResult.riasecCode,
          scores: calculatedResult.scores,
        },
      });

      // 6. Update the UserApplication status to COMPLETED.
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

  // 7. On success, revalidate the dashboard cache and redirect the user there.
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