import { prisma } from "@/lib/prisma";
import { Prisma, ApplicationStatus } from "@prisma/client";

// A helper to define the data shape we need for the card
const userApplicationForDashboard = Prisma.validator<Prisma.UserApplicationDefaultArgs>()({
  include: {
    application: {
      include: {
        test: {
          select: {
            description: true,
          },
        },
      },
    },
  },
});

export type UserApplicationForDashboard = Prisma.UserApplicationGetPayload<
  typeof userApplicationForDashboard
>;

/**
 * Fetches the most relevant, actionable test application for a given user.
 * It prioritizes a test that is IN_PROGRESS, otherwise it finds the
 * soonest upcoming test that has NOT_STARTED.
 * @param userId The ID of the user.
 */
export async function getNextApplicationForUser(
  userId: string
): Promise<UserApplicationForDashboard | null> {
  try {
    // First, check if the user has a test currently in progress.
    const inProgressApplication = await prisma.userApplication.findFirst({
      where: {
        userId: userId,
        status: ApplicationStatus.IN_PROGRESS,
      },
      ...userApplicationForDashboard,
    });

    if (inProgressApplication) {
      return inProgressApplication;
    }

    // If not, find the soonest upcoming test that has not been started yet.
    const notStartedApplication = await prisma.userApplication.findFirst({
      where: {
        userId: userId,
        status: ApplicationStatus.NOT_STARTED,
        application: {
          // Ensure we don't show tests whose availability window has passed.
          availableUntil: {
            gte: new Date(), // Greater than or equal to now
          }
        }
      },
      orderBy: {
        application: {
          availableFrom: 'asc', // Get the one starting soonest
        },
      },
      ...userApplicationForDashboard,
    });

    return notStartedApplication; // This will be the application or null if none are found

  } catch (error) {
    console.error("Error fetching next application for user:", error);
    return null;
  }
}