import type { Question } from "../types";
import { Input } from "@/components/ui/Input";
import { useEffect, useRef } from "react";

interface SentenceRewriteQuestionProps {
  question: Question;
  payload?: Record<string, unknown> | null;
  onChange: (value: Record<string, unknown>) => void;
  onEnterPress?: () => void;
  disabled?: boolean;
  checkedFeedback?: {
    isCorrect: boolean;
    feedback?: string;
  } | null;
}

export function SentenceRewriteQuestion({
  question,
  payload = {},
  onChange,
  onEnterPress,
  disabled = false,
  checkedFeedback = null,
}: SentenceRewriteQuestionProps) {
  const text = (payload?.text as string) ?? "";

  let inputStyle = "text-lg font-medium tracking-wide w-full focus:ring-2 focus:ring-primary transition-all duration-200";
  if (checkedFeedback) {
    if (checkedFeedback.isCorrect) {
      inputStyle += " border-green-500 bg-green-500/5 focus:ring-green-500";
    } else {
      inputStyle += " border-red-500 bg-red-500/5 focus:ring-red-500";
    }
  }

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input when the question changes
    if (!disabled && !checkedFeedback) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [question.id, disabled, checkedFeedback]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onEnterPress) {
      onEnterPress();
    }
  };

  const metadata = question.metadata as Record<string, unknown> | undefined;
  const keyword = (metadata?.keyword as string) ?? "";
  const acceptedAnswers = (metadata?.acceptedAnswers as string[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="text-lg md:text-xl font-medium text-text-primary leading-relaxed bg-neutral-card p-6 rounded-xl border border-neutral-border shadow-sm">
        <span className="inline-block px-2.5 py-1 text-xs font-bold bg-primary/10 border border-primary/30 text-primary rounded-full mb-3 uppercase tracking-wider">
          Sentence Rewrite
        </span>
        <p className="mb-2">{question.questionText}</p>
        {keyword && (
          <p className="text-sm text-text-secondary mt-2">
            Use the keyword: <span className="font-bold text-amber-500 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md">&quot;{keyword}&quot;</span> (do not alter this word).
          </p>
        )}
      </div>

      <div className="bg-neutral-card p-6 rounded-xl border border-neutral-border space-y-4">
        <label className="block text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Write Your Rewritten Sentence
        </label>
        <Input
          ref={inputRef}
          value={text}
          onChange={(e) => !checkedFeedback && onChange({ text: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="Type your complete sentence here..."
          disabled={disabled}
          readOnly={!!checkedFeedback}
          autoComplete="off"
          className={inputStyle}
        />
        {checkedFeedback && !checkedFeedback.isCorrect && acceptedAnswers.length > 0 && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl text-sm font-semibold flex flex-col gap-1.5 animate-fade-in mt-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-text-primary font-bold text-xs uppercase tracking-wider">Accepted Answers:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs text-text-secondary font-medium">
              {acceptedAnswers.map((ans, index) => (
                <li key={index}>{ans}</li>
              ))}
            </ul>
          </div>
        )}
        {!checkedFeedback && (
          <p className="text-xs text-text-secondary">
            Note: Pay close attention to grammar, tense, and spelling details.
          </p>
        )}
      </div>
    </div>
  );
}
export default SentenceRewriteQuestion;
