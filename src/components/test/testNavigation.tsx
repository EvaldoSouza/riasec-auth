"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Define the props the component expects to receive.
interface TestNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  isNextDisabled: boolean;
  isPreviousDisabled: boolean;
}

/**
 * A presentational component that renders the Previous and Next buttons
 * for the test-taking interface.
 */
export function TestNavigation({
  onNext,
  onPrevious,
  isNextDisabled,
  isPreviousDisabled,
}: TestNavigationProps) {
  return (
    <div className="flex justify-between items-center mt-6">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isPreviousDisabled}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Anterior
      </Button>
      <Button onClick={onNext} disabled={isNextDisabled}>
        Próximo
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}