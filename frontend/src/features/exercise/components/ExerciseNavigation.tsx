import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ExerciseNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function ExerciseNavigation({
  currentIndex,
  totalQuestions,
  onPrev,
  onNext,
  onSubmit,
  isSubmitting = false,
}: ExerciseNavigationProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className="flex items-center justify-between border-t border-neutral-border py-4 px-6 bg-neutral-card shadow-lg">
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onPrev}
          disabled={isFirst}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        {isLast ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onSubmit}
            isLoading={isSubmitting}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700 shadow-sm"
          >
            <Send className="h-4 w-4" />
            <span>Submit Practice</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onNext}
            className="flex items-center gap-2"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
export default ExerciseNavigation;
