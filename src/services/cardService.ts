import { prisma } from "@/lib/prisma"

/**
 * Fetches all card records from the database.
 */
export async function getAllCards() {
  try {
    const cards = await prisma.card.findMany();
    return cards;
  } catch (error) {
    console.error("Failed to fetch cards:", error);
    return [];
  }
}

