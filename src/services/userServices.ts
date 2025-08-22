import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

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