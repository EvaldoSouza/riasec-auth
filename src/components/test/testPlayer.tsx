"use client";

import React, { useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Card as CardType, Answer } from "@prisma/client";
import { DroppableSquare } from './droppableSquare';
import { DraggableCard } from './draggableCard';

// --- Helper Constants for the Matrix ---
// We define the labels and values for our axes to keep the JSX clean.
const competenceLevels = [
  { id: "LOW", label: "Baixa Competência" },
  { id: "AVERAGE", label: "Competência Média" },
  { id: "HIGH", label: "Alta Competência" },
];

const affinityLevels = [
  { id: "LOVE", label: "Amo" },
  { id: "LIKE", label: "Gosto" },
  { id: "INDIFFERENT", label: "Indiferente" },
  { id: "DISLIKE", label: "Não Gosto" },
  { id: "HATE", label: "Odeio" },
];
// --- End Helper Constants ---

// Define the shape of the data this component will receive from the server page.
interface TestPlayerProps {
  applicationId: string;
  cards: CardType[];
  initialAnswers: Answer[];
}

// Define the shape for our local answers state
type AnswersState = {
  [cardId: string]: {
    competence: string;
    affinity: string;
  };
};

/**
 * The main client component for the interactive test-taking experience.
 */
export function TestPlayer({ applicationId, cards, initialAnswers }: TestPlayerProps) {

    const [answers, setAnswers] = useState<AnswersState>(() => {
    
        const initialState: AnswersState = {};

    
        initialAnswers.forEach(ans => {
            if (ans.cardId && ans.competenceResponse && ans.affinityResponse) {
        
                initialState[ans.cardId] = {          
                
                    competence: ans.competenceResponse,       
                    affinity: ans.affinityResponse,
        };
      }
    });
    return initialState;
  });
  
  // This state will track which question card to display from the `cards` array.
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentCard = cards[currentIndex];

  // A safety check in case there are no cards.
  if (!currentCard) {
    return <div>Teste concluído ou sem cartões.</div>
  }

  // This is the event handler that will fire after a drag operation ends.
  // For now, we will just log the event to see it working.
  function handleDragEnd(event: DragEndEvent) {
    console.log("Drag ended!", event);
    
    const { active, over } = event;

    // We'll add the logic here later to update our answers state.
    if (over) {
      console.log(`Card ${active.id} was dropped over square ${over.id}`);
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col md:flex-row gap-8">
        
        <div className="w-full md:w-2/5">
          {/* Placeholder for the Draggable Card */}
          <h2 className="text-xl font-semibold mb-4">Questão {currentIndex + 1} de {cards.length}</h2>
          <div className="p-4 border rounded-lg min-h-[200px] bg-muted">
            <DraggableCard card={currentCard} />
          </div>
        </div>

        <div className="w-full md:w-3/5">
          {/* 2. This is the rendered Answer Matrix */}
          <div className="flex justify-around mb-2">
              {competenceLevels.map(level => (
                  <div key={level.id} className="w-1/3 text-center text-sm font-semibold">{level.label}</div>
              ))}
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col justify-around text-right text-sm font-semibold">
                {affinityLevels.map(level => (
                    <div key={level.id} className="h-24 flex items-center">{level.label}</div>
                ))}
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2">
              {/* 3. We use nested loops to create the 3x5 grid. */}
              {affinityLevels.map(affinity => (
                competenceLevels.map(competence => {
                  // The unique ID for each square is a combination of its coordinates.
                  const squareId = `competence-${competence.id}-affinity-${affinity.id}`;
                  return (
                    <DroppableSquare key={squareId} id={squareId} />
                  );
                })
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </DndContext>
  );
}