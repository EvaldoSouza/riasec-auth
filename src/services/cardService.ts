import { prisma } from "@/lib/prisma"
import { Card } from "@prisma/client";

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

/**
 * Fetches a single card by its unique ID.
 * @param id The ID of the card to fetch.
 * @returns The card object, or null if not found or an error occurs.
 */
export async function getCardById(id: string): Promise<Card | null> {
  try {
    const card = await prisma.card.findUnique({
      where: {
        id: id,
      },
    });
    return card;
  } catch (error) {
    console.error("Failed to fetch card by ID:", error);
    return null;
  }
}