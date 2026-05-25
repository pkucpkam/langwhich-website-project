import { cn } from "@/lib/utils";

interface QuestionPaletteProps {
  questions: { id: number }[];
  currentIndex: number;
  onSelect: (index: number) => void;
  answers: Record<number, Record<string, unknown>>;
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
  const getHasAnswer = (questionId: number) => {
    const ans = answers[questionId];
    return !!(
      ans &&
      Object.keys(ans).length > 0 &&
      Object.values(ans).some((value) => value !== null && value !== undefined && value !== "")
    );
  };

  const answeredCount = questions.filter((q) => getHasAnswer(q.id)).length;
  const checkedCount = questions.filter((q) => checkedQuestions[q.id]).length;

  return (
    <div className="bg-neutral-card border border-neutral-border rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            Question Heatmap
          </h3>
          <p className="mt-1 text-[11px] font-medium text-text-secondary">
            {answeredCount}/{questions.length} answered
            {practiceMode === "INSTANT" ? `, ${checkedCount} checked` : ""}
          </p>
        </div>
        <span className="rounded-md border border-neutral-border bg-neutral-background px-2 py-1 text-[10px] font-bold text-text-secondary">
          Q{currentIndex + 1}
        </span>
      </div>
      
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(32px, 1fr))" }}
      >
        {questions.map((q, idx) => {
          const isActive = idx === currentIndex;
          const hasAnswer = getHasAnswer(q.id);
          const isSaved = savedAnswers[q.id] === true;
          const checked = checkedQuestions[q.id];

          let btnClass = "";
          if (isActive) {
            btnClass = "bg-primary border-primary text-white shadow-md shadow-primary/20 ring-2 ring-primary/40 ring-offset-2 ring-offset-neutral-card";
          } else if (practiceMode === "INSTANT" && checked) {
            if (checked.isCorrect) {
              btnClass = "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/20";
            } else {
              btnClass = "bg-rose-500 border-rose-500 text-white hover:bg-rose-600 shadow-sm shadow-rose-500/20";
            }
          } else if (hasAnswer) {
            if (isSaved) {
              btnClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20";
            } else {
              btnClass = "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20";
            }
          } else {
            btnClass = "bg-neutral-background border-neutral-border text-text-secondary/60 hover:bg-neutral-border/20 hover:text-text-primary";
          }

          const label = `Question ${idx + 1}${
            isActive
              ? ", current"
              : practiceMode === "INSTANT" && checked
                ? checked.isCorrect
                  ? ", correct"
                  : ", incorrect"
                : hasAnswer
                  ? isSaved
                    ? ", answered and synced"
                    : ", unsaved changes"
                  : ", not answered"
          }`;

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(idx)}
              title={label}
              aria-label={label}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold leading-none transition-all duration-200 cursor-pointer active:scale-95 hover:scale-105",
                btnClass
              )}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="border-t border-neutral-border pt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
        <div className="flex items-center gap-2 text-text-secondary font-medium">
          <span className="h-3 w-3 rounded-full bg-primary border border-primary shadow-sm shadow-primary/20"></span>
          <span>Current</span>
        </div>
        
        {practiceMode === "INSTANT" ? (
          <>
            <div className="flex items-center gap-2 text-text-secondary font-medium">
              <span className="h-3 w-3 rounded-full bg-emerald-500 border border-emerald-500 shadow-sm shadow-emerald-500/20"></span>
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary font-medium">
              <span className="h-3 w-3 rounded-full bg-rose-500 border border-rose-500 shadow-sm shadow-rose-500/20"></span>
              <span>Incorrect</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-text-secondary font-medium">
              <span className="h-3 w-3 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30"></span>
              <span>Synced</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary font-medium">
              <span className="h-3 w-3 rounded-[3px] bg-amber-500/10 border border-amber-500/30"></span>
              <span>Unsaved</span>
            </div>
          </>
        )}
        
        <div className="flex items-center gap-2 text-text-secondary font-medium">
          <span className="h-3 w-3 rounded-[3px] bg-neutral-background border border-neutral-border"></span>
          <span>Empty</span>
        </div>
      </div>
    </div>
  );
}
export default QuestionPalette;
