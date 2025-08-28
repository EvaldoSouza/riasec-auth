import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * A helper to define the shape of the data for the test player.
 * It includes the UserApplication, the Test, and all Cards for that Test.
 */
const userApplicationWithCards = Prisma.validator<Prisma.UserApplicationDefaultArgs>()({
  include: {
    application: {
      include: {
        test: {
          include: {
            cards: {
              include: {
                card: true, // This gets the full Card object for each question
              },
            },
          },
        },
      },
    },
  },
});

export type UserApplicationWithCards = Prisma.UserApplicationGetPayload<
  typeof userApplicationWithCards
>;

/**
 * Fetches the complete data needed for a user to take a test.
 * @param userId The ID of the currently logged-in user.
 * @param applicationId The ID of the specific application they are taking.
 * @returns The detailed application object, or null if not found or not authorized.
 */
export async function getTestForUser(
  userId: string,
  applicationId: string
): Promise<UserApplicationWithCards | null> {
  try {
    const userApplication = await prisma.userApplication.findUnique({
      where: {
        // This is a crucial security check: we find the application only if it
        // belongs to the currently authenticated user.
        userId_applicationId: {
          userId,
          applicationId,
        },
      },
      // Use the include helper to get all related data in one query.
      ...userApplicationWithCards,
    });
    return userApplication;
  } catch (error) {
    console.error("Error fetching test for user:", error);
    return null;
  }
}

/**
 * Fetches all existing answers for a user's specific test application.
 */
export async function getInitialAnswers(userId: string, applicationId: string) {
  try {
    const answers = await prisma.answer.findMany({
      where: {
        userApplicationUserId: userId,
        userApplicationApplicationId: applicationId,
      },
    });
    return answers;
  } catch (error) {
    console.error("Error fetching initial answers:", error);
    return [];
  }
}

