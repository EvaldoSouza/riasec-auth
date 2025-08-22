import { prisma as db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * A helper to define the exact shape of the data we're fetching.
 * This is a Prisma best practice for creating types from complex queries.
 */
const applicationWithDetails = Prisma.validator<Prisma.ApplicationDefaultArgs>()({
  include: {
    test: {
      select: {
        description: true, // Include the test's description
      },
    },
    _count: {
      select: {
        participants: true, // Get a count of participants in the UserApplication table
      },
    },
  },
});

// This exported type can be used in our components for full type safety.
export type ApplicationWithDetails = Prisma.ApplicationGetPayload<
  typeof applicationWithDetails
>;

/**
 * Fetches all Application records with their related test description
 * and a count of their participants.
 */
export async function getAllApplications(): Promise<ApplicationWithDetails[]> {
  try {
    const applications = await db.application.findMany({
      // Use the include/count helper we defined above
      ...applicationWithDetails,
      orderBy: {
        createdAt: 'desc', // Show the most recently created applications first
      },
    });
    return applications;
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return [];
  }
}