"use client";

import { useDroppable } from "@dnd-kit/core";
import { Card as CardType } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface MatrixSquareProps {
  // A unique ID for dnd-kit, e.g., "competence-High-affinity-Love"
  id: string;
  // An array of all cards the user has placed in this square.
  cardsInSquare: CardType[];
  // A callback function to handle when a user clicks a card in the popover to jump to it.
  onJumpTo: (cardId: string) => void;
}

/**
 * A component that represents a single square in the answer matrix. It is a drop
 * target, displays the last-placed card, and contains a popover to review all
 * cards placed in it.
 */
export function MatrixSquare({ id, cardsInSquare, onJumpTo }: MatrixSquareProps) {
  // 1. We use the `useDroppable` hook from dnd-kit to make this a valid drop zone.
  const { isOver, setNodeRef } = useDroppable({ id });

  // 2. We determine the last card dropped in this square to display its question.
  const lastCard = cardsInSquare.length > 0 ? cardsInSquare[cardsInSquare.length - 1] : null;

  return (
    // 3. The entire component is wrapped in a Popover. The square itself will be the trigger.
    <Popover>
      <PopoverTrigger asChild>
        {/* This div is our main droppable element */}
        <div
          ref={setNodeRef} // The ref from dnd-kit must be attached here.
          className={cn(
            "h-24 w-full border flex items-center justify-center text-center p-2 rounded-md transition-all duration-150",
            // We provide visual feedback when a card is being dragged over.
            isOver ? "bg-primary/20 ring-2 ring-primary" : "bg-muted/50",
            // We also provide feedback if the square is a valid drop target (has a card picked up).
            // This would be controlled by a prop from the parent, let's call it `isDropDisabled`.
            // For now, we'll assume it's always enabled.
            "hover:bg-muted"
          )}
        >
          {/* 4. Display the question of the last card dropped here. */}
          {lastCard ? (
            <span className="text-xs font-semibold truncate">
              {lastCard.question}
            </span>
          ) : null}
        </div>
      </PopoverTrigger>
      
      {/* 5. The content of the Popover, which only renders if there are cards in the square. */}
      {cardsInSquare.length > 0 && (
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Questões Respondidas</h4>
              <p className="text-sm text-muted-foreground">
                Clique em uma questão para rever ou alterar sua resposta.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {/* We map over all cards in the square to create a list. */}
              {cardsInSquare.map(card => (
                <Button
                  key={card.id}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => onJumpTo(card.id)}
                >
                  {card.question}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}