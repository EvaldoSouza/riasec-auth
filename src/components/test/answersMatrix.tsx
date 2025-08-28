"use client";

import * as React from "react";
import { Card as CardType } from "@prisma/client";
import { MatrixSquare } from './matrixSquare';
import { competenceLevels, affinityLevels } from "./constants";

// This is the shape of the answers state object from the parent TestPlayer
type AnswersState = {
  [cardId: string]: {
    competenceResponse: string;
    affinityResponse: string;
  };
};

interface AnswerMatrixProps {
  answers: AnswersState;
  cards: CardType[];
  onJumpTo: (cardId: string) => void;
  // We'll add activeCardId later for the click-to-place model
}

/**
 * Renders the entire 3x5 answer grid, distributing answered cards
 * into the correct MatrixSquare components.
 */
export function AnswerMatrix({ answers, cards, onJumpTo }: AnswerMatrixProps) {

  // 1. A crucial performance optimization using `useMemo`.
  // This function transforms the flat `answers` object into a grid structure
  // that's easy to render. It only recalculates when the answers change.
  const cardsBySquare = React.useMemo(() => {
    const grid: { [squareId: string]: CardType[] } = {};

    // Find the full card object for each answer and group it by its square's ID.
    for (const cardId in answers) {
      const answer = answers[cardId];
      const card = cards.find(c => c.id === cardId);
      if (card && answer) {
        const squareId = `competence-${answer.competenceResponse}-affinity-${answer.affinityResponse}`;
        if (!grid[squareId]) {
          grid[squareId] = [];
        }
        grid[squareId].push(card);
      }
    }
    return grid;
  }, [answers, cards]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center">Sua Resposta</h2>
      {/* Renders the X-axis labels (Competence) */}
      <div className="flex justify-around mb-2 text-center text-sm font-semibold">
        {competenceLevels.map(level => (
          <div key={level.id} className="w-1/3">{level.label}</div>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Renders the Y-axis labels (Affinity) */}
        <div className="flex flex-col justify-around text-right text-sm font-semibold">
          {affinityLevels.map(level => (
            <div key={level.id} className="h-24 flex items-center">{level.label}</div>
          ))}
        </div>

        {/* Renders the 3x5 grid of droppable squares */}
        <div className="flex-1 grid grid-cols-3 gap-2">
          {affinityLevels.map(affinity =>
            competenceLevels.map(competence => {
              const squareId = `competence-${competence.id}-affinity-${affinity.id}`;
              const cardsInThisSquare = cardsBySquare[squareId] || [];

              return (
                <MatrixSquare
                  key={squareId}
                  id={squareId}
                  cardsInSquare={cardsInThisSquare}
                  onJumpTo={onJumpTo}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}