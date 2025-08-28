"use client";

import { useState, useEffect, useMemo, useActionState } from "react";
import { useDebounce } from "@/lib/hooks";
import { finishTest, resetAnswer, saveProgress } from "@/actions/testTakingActions";
import { Card as CardType, Answer } from "@prisma/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { TestCardDisplay } from "./testCardDisplay";
import { AnswerMatrix } from "./answersMatrix";
import { TestNavigation } from "./testNavigation";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

// This is the shape of our local answers state object.
type AnswersState = {
  [cardId: string]: {
    competenceResponse: string;
    affinityResponse: string;
  };
};

// These are the props received from the server page.
interface TestPlayerProps {
  applicationId: string;
  cards: CardType[];
  initialAnswers: Answer[];
}

function FinishButton({ applicationId }: { applicationId: string }) {
  const [state, formAction] = useActionState(finishTest, null);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (state?.status === 'error') {
      toast.error(state.message);
    }
    // Success is handled by a redirect in the server action.
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="applicationId" value={applicationId} />
      <Button type="submit" variant="destructive" size="lg" className="w-full" disabled={pending}>
        {pending ? "Finalizando..." : "Finalizar e Ver Resultados"}
      </Button>
      {state?.status === 'error' && <p className="text-sm text-destructive mt-2 text-center">{state.message}</p>}
    </form>
  );
}

export function TestPlayer({ applicationId, cards, initialAnswers }: TestPlayerProps) {
  // --- 1. STATE MANAGEMENT ---
  
  // This state holds all the answers for the current session.
  // It's initialized with any answers previously saved to the database.
  const [answers, setAnswers] = useState<AnswersState>(() => {
    const initialState: AnswersState = {};
    initialAnswers.forEach(ans => {
      if (ans.cardId && ans.competenceResponse && ans.affinityResponse) {
        initialState[ans.cardId] = {
          competenceResponse: ans.competenceResponse,
          affinityResponse: ans.affinityResponse,
        };
      }
    });
    return initialState;
  });

  // This state tracks the index of the card currently being displayed from the main `cards` array.
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- 2. DERIVED STATE ---
  
  // Using useMemo, we calculate the list of unanswered cards.
  // This list only recalculates when `cards` or `answers` change.
  const unansweredCards = useMemo(() => 
    cards.filter(card => !answers[card.id]),
    [cards, answers]
  );

  // Find the first unanswered card to start the test from.
  useEffect(() => {
    const firstUnansweredIndex = cards.findIndex(card => !answers[card.id]);
    setCurrentIndex(firstUnansweredIndex !== -1 ? firstUnansweredIndex : 0);
  }, []); // Runs only once on mount

  // --- 3. AUTOSAVE LOGIC ---
  
  const debouncedAnswers = useDebounce(answers, 2000); // Debounce state for 2 seconds.

  useEffect(() => {
    // This effect runs when the debouncedAnswers value changes.
    const save = async () => {
      // Don't save if there are no answers yet.
      if (Object.keys(debouncedAnswers).length === 0) return;
      
      const result = await saveProgress(applicationId, debouncedAnswers);
      if (result.status === 'success') {
        toast.success("Progresso salvo.", { duration: 2000 });
      } else {
        toast.error(result.message);
      }
    };
    save();
  }, [debouncedAnswers, applicationId]);


  // --- 4. HANDLER FUNCTIONS ---

  const handleNext = () => {
    const currentUnansweredIndex = unansweredCards.findIndex(card => card.id === cards[currentIndex]?.id);
    if (currentUnansweredIndex < unansweredCards.length - 1) {
      const nextCardId = unansweredCards[currentUnansweredIndex + 1].id;
      const nextOverallIndex = cards.findIndex(card => card.id === nextCardId);
      setCurrentIndex(nextOverallIndex);
    }
  };
  
  const handlePrevious = () => {
    const currentUnansweredIndex = unansweredCards.findIndex(card => card.id === cards[currentIndex]?.id);
    if (currentUnansweredIndex > 0) {
      const prevCardId = unansweredCards[currentUnansweredIndex - 1].id;
      const prevOverallIndex = cards.findIndex(card => card.id === prevCardId);
      setCurrentIndex(prevOverallIndex);
    }
  };

  const handleJumpTo = async (cardId: string) => {
    // 1. Perform an "optimistic update" on the client state for an instant UI response.
    // We create a new answers object and delete the property for the selected card.
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[cardId];
      return newAnswers;
    });

    // 2. We find the index of the card we are jumping to and set it as current.
    const jumpIndex = cards.findIndex(card => card.id === cardId);
    if (jumpIndex !== -1) {
      setCurrentIndex(jumpIndex);
    }
    
    // 3. In the background, call the server action to persist the deletion.
    // We don't need to block the UI by awaiting the result here.
    // The regular autosave will also sync the state eventually.
    const result = await resetAnswer(applicationId, cardId);
    if (result.status === 'error') {
      // Optionally, show a toast if the server-side delete fails.
      toast.error(result.message);
      // Here you could add logic to revert the optimistic update if needed.
    }
  };

  /**
   * This is the main event handler that connects the drag-and-drop action to our state.
   * It is called by the DndContext provider when a user drops a card.
   */
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // 1. Guard against invalid drops (e.g., dropping outside the matrix).
    if (!over) {
      return;
    }

    // 2. Extract the card ID and the square ID from the event.
    const cardId = active.id as string;
    const squareId = over.id as string; // e.g., "competence-HIGH-affinity-LOVE"

    // 3. Parse the competence and affinity values from the square's ID.
    const parts = squareId.split('-');
    const competence = parts[1];
    const affinity = parts[3];

    // 4. Update the local answers state with the new response.
    setAnswers(prev => ({
      ...prev,
      [cardId]: { competenceResponse: competence, affinityResponse: affinity },
    }));

    // 5. Automatically advance to the next unanswered question.
    handleNext();
  }

  // --- 5. RENDER ---
  
  const currentCard = cards[currentIndex];
  const progressValue = (Object.keys(answers).length / cards.length) * 100;
  const allQuestionsAnswered = unansweredCards.length === 0;

  

  return (
    <DndContext onDragEnd={handleDragEnd} >
      <div className="space-y-6">
        <Progress value={progressValue} />
        <div className="space-y-12">
          <AnswerMatrix
            answers={answers}
            cards={cards}
            onJumpTo={handleJumpTo}
          />

          <div className="flex items-center justify-center gap-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
              {allQuestionsAnswered
                ? "Revisão Final"
                : `Questão ${currentIndex + 1} de ${cards.length}`
              }
            </h2>
            
            {/* 1. Conditionally render the card or the "complete" message */}
            {allQuestionsAnswered ? (
              <Card className="flex items-center justify-center text-left p-8 min-w-[50px]">
                <CardContent className="space-y-2">
                  <h3 className="text-xl font-bold">Você respondeu todas as questões!</h3>
                  <p className="text-muted-foreground">
                    Revise suas respostas na matriz. Quando estiver pronto, clique em finalizar.
                  </p>
                </CardContent>
              </Card>
            ) : (
              currentCard && <TestCardDisplay card={currentCard} />
            )}

            {/* 2. Conditionally render the navigation or the finish button */}
            {allQuestionsAnswered ? (
              <FinishButton applicationId={applicationId} />
            ) : (
              <TestNavigation 
                onNext={handleNext} 
                onPrevious={handlePrevious}
                isNextDisabled={unansweredCards.findIndex(c => c.id === currentCard?.id) === unansweredCards.length - 1}
                isPreviousDisabled={unansweredCards.findIndex(c => c.id === currentCard?.id) === 0}
              />
            )}
          </div>          
        </div>
      </div>
    </DndContext>
  );
}