import type { Question } from "../types";

interface MultipleChoiceQuestionProps {
  question: Question;
  selectedOptionId?: number | null;
  onChange: (optionId: number) => void;
  disabled?: boolean;
}

export function MultipleChoiceQuestion({
  question,
  selectedOptionId,
  onChange,
  disabled = false,
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

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => !disabled && onChange(option.id)}
              disabled={disabled}
              className={`flex items-center gap-4 w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                isSelected
                  ? "bg-primary/10 border-primary text-text-primary shadow-sm ring-1 ring-primary"
                  : "bg-neutral-card border-neutral-border text-text-secondary hover:border-neutral-border hover:bg-neutral-border/30 hover:text-text-primary"
              } ${
                disabled
                  ? "opacity-70 cursor-not-allowed"
                  : "cursor-pointer active:scale-[0.995]"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-neutral-border/50 text-text-secondary"
                }`}
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
