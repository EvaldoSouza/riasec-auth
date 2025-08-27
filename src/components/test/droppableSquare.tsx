"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface DroppableSquareProps {
  id: string; // A unique ID for dnd-kit, e.g., "competence-High-affinity-Love"
  children?: React.ReactNode;
}

/**
 * A component that represents a single square in the answer matrix.
 * It uses the `useDroppable` hook from dnd-kit to become a valid drop target.
 */
export function DroppableSquare({ id, children }: DroppableSquareProps) {
  // 1. The `useDroppable` hook from dnd-kit provides the necessary props and state.
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  // 2. We use conditional styling to give the user visual feedback.
  // The square will highlight when a draggable card is hovering over it.
  const style = {
    transition: 'background-color 0.2s ease',
  };

  return (
    // 3. `setNodeRef` is a ref that must be attached to the DOM element
    //    that you want to be the droppable area.
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "h-24 w-full border flex items-center justify-center text-center p-2 rounded-md",
        isOver ? "bg-primary/20 ring-2 ring-primary" : "bg-muted/50"
      )}
    >
      {children}
    </div>
  );
}