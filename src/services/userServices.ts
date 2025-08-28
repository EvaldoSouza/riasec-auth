import { prisma } from "@/lib/prisma";
import { ApplicationStatus, Prisma, Role } from "@prisma/client";

/**
 * Fetches all users with the 'CLIENTE' role.
 */
export async function getAllClientes() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: Role.CLIENTE,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

/**
 * A helper to define the shape of the data we're fetching for the user list.
 * It includes the user and a count of their completed applications.
 */
const userWithApplicationCount = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    _count: {
      select: {
        applications: {
          where: { status: ApplicationStatus.COMPLETED },
        },
      },
    },
  },
});

export type UserWithApplicationCount = Prisma.UserGetPayload<
  typeof userWithApplicationCount
>;

/**
 * Fetches all users from the database with a count of their completed tests.
 */
export async function getAllUsers(): Promise<UserWithApplicationCount[]> {
  try {
    const users = await prisma.user.findMany({
      // Use the include helper we defined above.
      ...userWithApplicationCount,
      orderBy: {
        createdAt: 'desc', // Show the newest users first
      },
    });
    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}