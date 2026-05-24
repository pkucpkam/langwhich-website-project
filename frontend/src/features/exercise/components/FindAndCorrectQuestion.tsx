import type { Question } from "../types";
import { Input } from "@/components/ui/Input";

interface FindAndCorrectQuestionProps {
  question: Question;
  payload?: Record<string, unknown> | null;
  onChange: (value: Record<string, unknown>) => void;
  disabled?: boolean;
  checkedFeedback?: {
    isCorrect: boolean;
    feedback?: string;
  } | null;
}

export function FindAndCorrectQuestion({
  question,
  payload = {},
  onChange,
  disabled = false,
  checkedFeedback = null,
}: FindAndCorrectQuestionProps) {
  const selectedMistake = (payload?.selectedMistake as string) ?? "";
  const correction = (payload?.correction as string) ?? "";

  let mistakeInputStyle = "text-lg font-medium tracking-wide focus:ring-2 focus:ring-primary transition-all duration-200";
  let correctionInputStyle = "text-lg font-medium tracking-wide focus:ring-2 focus:ring-primary transition-all duration-200";

  if (checkedFeedback) {
    if (checkedFeedback.isCorrect) {
      mistakeInputStyle += " border-green-500 bg-green-500/5 focus:ring-green-500";
      correctionInputStyle += " border-green-500 bg-green-500/5 focus:ring-green-500";
    } else {
      mistakeInputStyle += " border-red-500 bg-red-500/5 focus:ring-red-500";
      correctionInputStyle += " border-red-500 bg-red-500/5 focus:ring-red-500";
    }
  }

  const metadata = question.metadata as Record<string, unknown> | undefined;
  const mistakeText = (metadata?.mistakeText as string) ?? "";
  const acceptedAnswers = (metadata?.acceptedAnswers as string[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="text-lg md:text-xl font-medium text-text-primary leading-relaxed bg-neutral-card p-6 rounded-xl border border-neutral-border shadow-sm">
        <span className="inline-block px-2.5 py-1 text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full mb-3 uppercase tracking-wider">
          Find &amp; Correct the Mistake
        </span>
        <p>{question.questionText}</p>
      </div>

      <div className="bg-neutral-card p-6 rounded-xl border border-neutral-border grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-text-secondary uppercase tracking-wider">
            1. Incorrect Part
          </label>
          <Input
            value={selectedMistake}
            onChange={(e) =>
              !checkedFeedback &&
              onChange({
                selectedMistake: e.target.value,
                correction,
              })
            }
            placeholder="e.g. have"
            disabled={disabled || !!checkedFeedback}
            autoComplete="off"
            className={mistakeInputStyle}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-text-secondary uppercase tracking-wider">
            2. Your Correction
          </label>
          <Input
            value={correction}
            onChange={(e) =>
              !checkedFeedback &&
              onChange({
                selectedMistake,
                correction: e.target.value,
              })
            }
            placeholder="e.g. has"
            disabled={disabled || !!checkedFeedback}
            autoComplete="off"
            className={correctionInputStyle}
          />
        </div>
      </div>

      {checkedFeedback && (
        <div className={`p-4 rounded-xl border text-sm font-semibold flex flex-col gap-2 animate-fade-in ${
          checkedFeedback.isCorrect 
            ? "bg-green-500/10 border-green-500/20 text-green-500" 
            : "bg-red-500/10 border-red-500/20 text-red-500"
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${checkedFeedback.isCorrect ? "bg-green-500" : "bg-red-500"}`}></span>
            <span>{checkedFeedback.feedback || (checkedFeedback.isCorrect ? "Perfect correction!" : "Incorrect.")}</span>
          </div>
          {!checkedFeedback.isCorrect && mistakeText && (
            <div className="mt-2 text-xs text-text-secondary border-t border-neutral-border pt-2 space-y-1">
              <p><span className="font-bold text-text-primary">Mistake word:</span> &quot;{mistakeText}&quot;</p>
              {acceptedAnswers.length > 0 && (
                <p><span className="font-bold text-text-primary">Accepted corrections:</span> {acceptedAnswers.join(" or ")}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default FindAndCorrectQuestion;
