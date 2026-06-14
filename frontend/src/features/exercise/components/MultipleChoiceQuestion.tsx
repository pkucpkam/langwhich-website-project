import type { Question } from "../types";

interface MultipleChoiceQuestionProps {
  question: Question;
  selectedOptionId?: number | null;
  onChange: (optionId: number) => void;
  disabled?: boolean;
  checkedFeedback?: {
    isCorrect: boolean;
    correctOptionId?: number | null;
  } | null;
}

export function MultipleChoiceQuestion({
  question,
  selectedOptionId,
  onChange,
  disabled = false,
  checkedFeedback = null,
}: MultipleChoiceQuestionProps) {
  const options = question.options ?? [];

  return (
    <div className="space-y-6">
      <div className="text-lg md:text-xl font-medium text-text-primary leading-relaxed bg-neutral-card p-6 rounded-xl border border-neutral-border shadow-sm">
        {question.questionText}
      </div>
      <div className="grid grid-cols-1 gap-3">
        {options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx); // A, B, C, D...
          const isSelected = selectedOptionId === option.id;
          const isCorrectOption = checkedFeedback?.correctOptionId === option.id;

          let btnStyle = "";
          let badgeStyle = "";

          if (checkedFeedback) {
            // Checked State
            if (isSelected) {
              if (checkedFeedback.isCorrect) {
                btnStyle = "bg-green-500/10 border-green-500 text-text-primary ring-1 ring-green-500 shadow-sm";
                badgeStyle = "bg-green-500 text-white";
              } else {
                btnStyle = "bg-red-500/10 border-red-500 text-text-primary ring-1 ring-red-500 shadow-sm";
                badgeStyle = "bg-red-500 text-white";
              }
            } else if (isCorrectOption) {
              btnStyle = "bg-green-500/10 border-green-500 text-text-primary ring-1 ring-green-500 shadow-sm";
              badgeStyle = "bg-green-500 text-white";
            } else {
              btnStyle = "bg-neutral-card border-neutral-border text-text-secondary opacity-60";
              badgeStyle = "bg-neutral-border/50 text-text-secondary";
            }
          } else {
            // Unchecked State
            if (isSelected) {
              btnStyle = "bg-primary/10 border-primary text-text-primary shadow-sm ring-1 ring-primary";
              badgeStyle = "bg-primary text-white";
            } else {
              btnStyle = "bg-neutral-card border-neutral-border text-text-secondary hover:border-neutral-border hover:bg-neutral-border/30 hover:text-text-primary";
              badgeStyle = "bg-neutral-border/50 text-text-secondary";
            }
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => !disabled && !checkedFeedback && onChange(option.id)}
              disabled={disabled || !!checkedFeedback}
              className={`flex items-center gap-4 w-full p-4 rounded-xl border text-left transition-all duration-200 ${btnStyle} ${
                disabled || !!checkedFeedback
                  ? "cursor-not-allowed"
                  : "cursor-pointer active:scale-[0.995]"
              }`}
            >
              <span
                className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${badgeStyle}`}
              >
                {letter}
              </span>
              <span className="text-base font-medium">{option.optionText}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default MultipleChoiceQuestion;
