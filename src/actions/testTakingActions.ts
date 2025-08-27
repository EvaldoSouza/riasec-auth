"use server";

//import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ActionState } from "@/lib/definitions";
import { ApplicationStatus } from "@prisma/client";

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