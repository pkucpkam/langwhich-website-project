import { cn } from "@/lib/utils";

interface QuestionPaletteProps {
  questions: { id: number }[];
  currentIndex: number;
  onSelect: (index: number) => void;
  answers: Record<number, { selectedOptionId?: number | null; textAnswer?: string | null }>;
  savedAnswers: Record<number, boolean>;
  practiceMode?: "INSTANT" | "ALL_AT_ONCE";
  checkedQuestions?: Record<
    number,
    {
      isCorrect: boolean;
      explanation?: string | null;
      correctOptionId?: number | null;
      correctAnswers?: string[] | null;
    }
  >;
}

export function QuestionPalette({
  questions,
  currentIndex,
  onSelect,
  answers,
  savedAnswers,
  practiceMode = "ALL_AT_ONCE",
  checkedQuestions = {},
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
            ((ans.selectedOptionId !== undefined && ans.selectedOptionId !== null) ||
              (ans.textAnswer !== undefined && ans.textAnswer !== null && ans.textAnswer !== ""));
          const isSaved = savedAnswers[q.id] === true;
          const checked = checkedQuestions[q.id];

          let btnClass = "";
          if (isActive) {
            btnClass = "bg-primary border-primary text-white shadow-sm ring-2 ring-primary ring-offset-2 ring-offset-neutral-background";
          } else if (practiceMode === "INSTANT" && checked) {
            if (checked.isCorrect) {
              btnClass = "bg-green-500 border-green-500 text-white hover:bg-green-600";
            } else {
              btnClass = "bg-red-500 border-red-500 text-white hover:bg-red-600";
            }
          } else if (hasAnswer) {
            if (isSaved) {
              btnClass = "bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20";
            } else {
              btnClass = "bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20";
            }
          } else {
            btnClass = "bg-neutral-background border-neutral-border text-text-secondary hover:bg-neutral-border/20 hover:text-text-primary";
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(idx)}
              className={cn(
                "h-10 rounded-lg font-bold text-sm flex items-center justify-center border transition-all duration-200 cursor-pointer active:scale-95",
                btnClass
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
        
        {practiceMode === "INSTANT" ? (
          <>
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="w-3.5 h-3.5 rounded bg-green-500 border border-green-500"></span>
              <span>Checked & Correct</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="w-3.5 h-3.5 rounded bg-red-500 border border-red-500"></span>
              <span>Checked & Incorrect</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="w-3.5 h-3.5 rounded bg-green-500/10 border border-green-500/30"></span>
              <span>Answered & Synced</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="w-3.5 h-3.5 rounded bg-yellow-500/10 border border-yellow-500/30"></span>
              <span>Unsaved Changes</span>
            </div>
          </>
        )}
        
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="w-3.5 h-3.5 rounded bg-neutral-background border border-neutral-border"></span>
          <span>Not Answered</span>
        </div>
      </div>
    </div>
  );
}
export default QuestionPalette;
