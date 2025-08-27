"use client";

import React from 'react';
import { useDraggable } from "@dnd-kit/core";
import { Card as CardType } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DraggableCardProps {
  card: CardType;
}

/**
 * A component that displays a single question card and makes it draggable.
 */
export function DraggableCard({ card }: DraggableCardProps) {
  // 1. The `useDraggable` hook provides the necessary attributes, listeners (event handlers),
  //    and state for making an element draggable. We must give it a unique ID.
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
  });

  // 2. When the card is being dragged, dnd-kit provides a CSS transform.
  //    We apply this to make the element move on the screen.
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    // 3. We attach the `setNodeRef` ref to the main element we want to drag.
    <div ref={setNodeRef} style={style}>
      {/* 4. The `listeners` and `attributes` must be spread onto the element
          that the user will click and hold to start the drag. */}
      <Card
        {...listeners}
        {...attributes}
        className={cn(
          "cursor-grab",
          // 5. We provide visual feedback when the card is being dragged.
          isDragging && "ring-2 ring-primary shadow-lg opacity-80"
        )}
      >
        <CardHeader>
          <CardTitle className="text-center">Arraste este cartão</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-lg font-medium">
          {card.question}
        </CardContent>
      </Card>
    </div>
  );
}