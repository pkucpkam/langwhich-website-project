import type { Question } from "../types";
import { Input } from "@/components/ui/Input";

interface FillBlankQuestionProps {
  question: Question;
  textAnswer?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function FillBlankQuestion({
  question,
  textAnswer = "",
  onChange,
  disabled = false,
}: FillBlankQuestionProps) {
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
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here..."
          disabled={disabled}
          autoComplete="off"
          className="text-lg font-medium tracking-wide max-w-md focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-text-secondary">
          Note: Spelling matters! Type carefully. Answers are generally not case-sensitive.
        </p>
      </div>
    </div>
  );
}
export default FillBlankQuestion;
