import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

/**
 * Fetches the most recent `TestResult` for a given user from a test
 * application that has been marked as COMPLETED.
 * @param userId The ID of the user.
 */
export async function getLatestCompletedResult(userId: string) {
  try {
    // This query is efficient. It finds the first result record that belongs
    // to the user, ensuring it's from a COMPLETED application, and orders
    // them to get the most recent one.
    const latestResult = await prisma.testResult.findFirst({
      where: {
        userId: userId,
        userApplication: {
          status: ApplicationStatus.COMPLETED,
        },
      },
      orderBy: {
        userApplication: {
          testFinishedAt: 'desc',
        },
      },
    });
    return latestResult;
  } catch (error) {
    console.error("Error fetching latest completed result:", error);
    return null;
  }
}