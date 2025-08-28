"use client";

import React from 'react';
import { useDraggable } from "@dnd-kit/core";
import { Card as CardType } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TestCardDisplayProps {
  card: CardType;
}

/**
 * A component that displays a single question card and makes it draggable.
 */
export function TestCardDisplay({ card }: TestCardDisplayProps) {
  // 1. The `useDraggable` hook from dnd-kit is the engine for this component.
  // We must provide a unique ID for the draggable element. The card's own ID is perfect.
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
  });

  // 2. The `transform` object contains the x/y coordinates during a drag.
  // We use this to apply a CSS transform to visually move the element.
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    // 3. The `setNodeRef` ref must be attached to the main DOM element that will be moved.
    <div ref={setNodeRef} style={style} className="touch-none">
      {/* 4. The `listeners` and `attributes` are spread onto the element that the user
          will physically "grab" to start dragging. In this case, the whole card. */}
      <Card
        {...listeners}
        {...attributes}
        className={cn(
          "cursor-grab",
          // 5. We apply visual feedback when the card is being dragged.
          isDragging && "ring-2 ring-primary shadow-lg opacity-80 z-50 relative"
        )}
      >
        <CardHeader>
          <CardTitle className="text-center text-sm font-medium text-muted-foreground">Arraste este cartão</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-lg font-semibold min-h-[75px] min-w-[20px] flex items-center justify-center">
          {card.question}
        </CardContent>
      </Card>
    </div>
  );
}