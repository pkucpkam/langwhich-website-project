import { cn } from "@/lib/utils";

interface QuestionPaletteProps {
  questions: { id: number }[];
  currentIndex: number;
  onSelect: (index: number) => void;
  answers: Record<number, { selectedOptionId?: number | null; textAnswer?: string | null }>;
  savedAnswers: Record<number, boolean>;
}

export function QuestionPalette({
  questions,
  currentIndex,
  onSelect,
  answers,
  savedAnswers,
}: QuestionPaletteProps) {
  return (
    <div className="bg-neutral-card border border-neutral-border rounded-xl p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
        Question Palette
      </h3>
      
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const isActive = idx === currentIndex;
          const ans = answers[q.id];
          const hasAnswer =
            ans &&
            (ans.selectedOptionId !== undefined && ans.selectedOptionId !== null ||
              (ans.textAnswer !== undefined && ans.textAnswer !== null && ans.textAnswer !== ""));
          const isSaved = savedAnswers[q.id] === true;

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(idx)}
              className={cn(
                "h-10 rounded-lg font-bold text-sm flex items-center justify-center border transition-all duration-200 cursor-pointer active:scale-95",
                isActive
                  ? "bg-primary border-primary text-white shadow-sm ring-2 ring-primary ring-offset-2 ring-offset-neutral-background"
                  : hasAnswer
                  ? isSaved
                    ? "bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20"
                    : "bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20"
                  : "bg-neutral-background border-neutral-border text-text-secondary hover:bg-neutral-border/20 hover:text-text-primary"
              )}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="border-t border-neutral-border pt-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="w-3.5 h-3.5 rounded bg-primary border border-primary"></span>
          <span>Current Active</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="w-3.5 h-3.5 rounded bg-green-500/10 border border-green-500/30"></span>
          <span>Answered & Synced</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="w-3.5 h-3.5 rounded bg-yellow-500/10 border border-yellow-500/30"></span>
          <span>Unsaved Changes</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="w-3.5 h-3.5 rounded bg-neutral-background border border-neutral-border"></span>
          <span>Not Answered</span>
        </div>
      </div>
    </div>
  );
}
export default QuestionPalette;
