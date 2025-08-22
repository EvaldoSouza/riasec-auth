"use server";

import { prisma } from "@/lib/prisma";

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
