"use server";

import { prisma } from "@/lib/prisma";
import { Card } from "@prisma/client";

export async function getAllTests() {
    try {
        const tests = await prisma.test.findMany({ orderBy:{createdAt: 'desc'}}) //mostrando o mais recente primeiro
        if(tests == null || tests.length === 0){
            console.log("Sem testes")
            //throw "Sem testes";
        }
        return tests
        
    } catch (error) {
        console.log(error)
        throw error;
    }
    
}

/**
 * Fetches a single test by its ID, including the IDs of the cards it contains.
 * @param id The ID of the test to fetch.
 */
export async function getTestByIdWithCards(id: string) {
  try {
    const test = await prisma.test.findUnique({
      where: { id },
      include: {
        // We include the 'cards' relation to get the join table records.
        // We only select the 'cardId' to be efficient.
        cards: {
          select: {
            cardId: true,
          },
        },
      },
    });
    return test;
  } catch (error) {
    console.error("Failed to fetch test by ID:", error);
    return null;
  }
}

/**
 * Fetches all the cards associated with a specific test application.
 * This is the core function for loading the questions for a user.
 * @param applicationId - The ID of the user's specific application instance.
 * @returns An array of Card objects, or null if the application is not found.
 */
export async function getCardsForApplication(applicationId: string): Promise<Card[] | null> {
  try {
    // 1. We query the Application model first to find the correct Test.
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        // 2. We then include the related Test...
        test: {
          include: {
            // 3. ...and from the Test, we include its related Cards.
            // This is a nested relational query.
            cards: {
              include: {
                card: true, // Include the full Card object from the join table
              },
            },
          },
        },
      },
    });

    if (!application) {
      return null; // Return null if the application doesn't exist.
    }

    // 4. We map the result to return a clean array of Card objects.
    const cards = application.test.cards.map(testCard => testCard.card);
    return cards;

  } catch (error) {
    console.error("Error fetching cards for application:", error);
    // Return null on any database error for the UI to handle gracefully.
    return null;
  }
}