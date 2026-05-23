import type { Question } from "../types";
import { Input } from "@/components/ui/Input";

interface FillBlankQuestionProps {
  question: Question;
  textAnswer?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  checkedFeedback?: {
    isCorrect: boolean;
    correctAnswers?: string[] | null;
  } | null;
}

export function FillBlankQuestion({
  question,
  textAnswer = "",
  onChange,
  disabled = false,
  checkedFeedback = null,
}: FillBlankQuestionProps) {
  let inputStyle = "text-lg font-medium tracking-wide max-w-md focus:ring-2 focus:ring-primary transition-all duration-200";
  if (checkedFeedback) {
    if (checkedFeedback.isCorrect) {
      inputStyle += " border-green-500 bg-green-500/5 focus:ring-green-500";
    } else {
      inputStyle += " border-red-500 bg-red-500/5 focus:ring-red-500";
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-lg md:text-xl font-medium text-text-primary leading-relaxed bg-neutral-card p-6 rounded-xl border border-neutral-border shadow-sm">
        {question.questionText}
      </div>
      <div className="bg-neutral-card p-6 rounded-xl border border-neutral-border space-y-4">
        <label className="block text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Your Answer
        </label>
        <Input
          value={textAnswer ?? ""}
          onChange={(e) => !checkedFeedback && onChange(e.target.value)}
          placeholder="Type your answer here..."
          disabled={disabled || !!checkedFeedback}
          autoComplete="off"
          className={inputStyle}
        />
        {checkedFeedback && !checkedFeedback.isCorrect && checkedFeedback.correctAnswers && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 max-w-md animate-fade-in mt-3">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Correct Answer: {checkedFeedback.correctAnswers.join(" or ")}</span>
          </div>
        )}
        {!checkedFeedback && (
          <p className="text-xs text-text-secondary">
            Note: Spelling matters! Type carefully. Answers are generally not case-sensitive.
          </p>
        )}
      </div>
    </div>
  );
}
export default FillBlankQuestion;
