import { Answer, Card, RiasecType } from "@prisma/client";
import { CalculatedRiasecResult } from "@/types/dashboard";

/**
 * @file This file contains the core business logic for calculating RIASEC scores.
 * It is a pure, testable service with no external dependencies like the database.
 */

// --- Step 1: Define the "Contracts" (Input and Output Types) ---

// This is the shape of the data the function expects to receive.
// It's an Answer object that must include its related Card data.
type AnswerWithCard = Answer & { card: Card };


// --- Step 2: Define the Scoring Configuration ---
// Best Practice: We define the scoring "rules" as configuration objects.
// This makes them easy to find and adjust in the future without changing the core logic.

const competenceScoreMap: Record<string, number> = {
  LOW: 1,
  AVERAGE: 2,
  HIGH: 3,
};

const affinityScoreMap: Record<string, number> = {
  HATE: 1,
  DISLIKE: 2,
  INDIFFERENT: 3,
  LIKE: 4,
  LOVE: 5,
};


// --- Step 3: The Main Calculation Function ---

/**
 * Takes an array of user answers and calculates the final RIASEC scores and 3-letter code.
 * @param answers - An array of the user's answers, with the related card data included.
 * @returns The calculated result object.
 */
export function calculateRiasecFromResponses(
  answers: AnswerWithCard[]
): CalculatedRiasecResult {

  // A. Initialize score counters for each of the six types.
  const scores = Object.values(RiasecType).reduce((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {} as Record<RiasecType, number>);

  // B. Iterate through each answer and aggregate the scores.
  for (const answer of answers) {
    // Gracefully handle missing or invalid response data by defaulting to 0.
    const competenceScore = competenceScoreMap[answer.competenceResponse ?? ''] ?? 0;
    const affinityScore = affinityScoreMap[answer.affinityResponse ?? ''] ?? 0;

    const totalScore = competenceScore + affinityScore;
    const type = answer.card.riasecType as keyof typeof scores;

    if (scores.hasOwnProperty(type)) {
      scores[type] += totalScore;
    }
  }

  // C. Determine the 3-letter code from the final scores.
  const sortedScores = Object.entries(scores)
    // Sort by score, descending.
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    // Take the top three types.
    .slice(0, 3);
    
  const riasecCode = sortedScores.map(score => score[0].charAt(0).toUpperCase()).join('');

  // D. Return the final, structured result object.
  return {
    riasecCode,
    scores: { // Ensure this also uses the enum for consistency
      [RiasecType.Realista]: scores.Realista,
      [RiasecType.Investigativo]: scores.Investigativo,
      [RiasecType.Artistico]: scores.Artistico,
      [RiasecType.Social]: scores.Social,
      [RiasecType.Empreendedor]: scores.Empreendedor,
      [RiasecType.Convencional]: scores.Convencional,
    }
  };
}