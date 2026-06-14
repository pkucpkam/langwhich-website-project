import type { Question } from "../types";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { FillBlankQuestion } from "./FillBlankQuestion";
import { FindAndCorrectQuestion } from "./FindAndCorrectQuestion";
import { SentenceRewriteQuestion } from "./SentenceRewriteQuestion";

interface QuestionRendererProps {
  question: Question;
  payload?: Record<string, unknown> | null;
  selectedOptionId?: number | null; // Legacy compatibility
  textAnswer?: string | null;       // Legacy compatibility
  onChange: (payload: Record<string, unknown>) => void;
  onEnterPress?: () => void;
  disabled?: boolean;
  checkedFeedback?: {
    isCorrect: boolean;
    score?: number;
    maxScore?: number;
    feedback?: string;
    explanation?: string | null;
    correctOptionId?: number | null;  // MC check compatibility
    correctAnswers?: string[] | null; // FIB check compatibility
  } | null;
}

export function QuestionRenderer({
  question,
  payload = {},
  selectedOptionId,
  textAnswer,
  onChange,
  onEnterPress,
  disabled = false,
  checkedFeedback = null,
}: QuestionRendererProps) {
  // Resolve unified payload from new or legacy inputs
  const resolvedPayload = payload && Object.keys(payload).length > 0
    ? payload 
    : {
        selectedOptionId,
        textAnswer,
      };

  return (
    <div className="space-y-6 animate-fade-in">
      {(() => {
        switch (question.type) {
          case "MULTIPLE_CHOICE": {
            // MCQ metadata can have "options"
            const metadata = question.metadata as Record<string, unknown> | undefined;
            const mcOptions = metadata?.options as { key: string; content: string }[] | undefined;

            const mappedQuestion = {
              ...question,
              options: question.options ?? (metadata?.options as any[])?.map((o: any, idx: number) => ({
                id: idx, // Use index for metadata-driven questions
                optionText: o.optionText ? o.optionText : (o.key && o.content ? `${o.key}. ${o.content}` : o.content || ""),
                sortOrder: idx,
              })) ?? []
            };

            const activeOptionId = (resolvedPayload?.selectedOptionId as number) ?? null;

            return (
              <MultipleChoiceQuestion
                question={mappedQuestion}
                selectedOptionId={activeOptionId}
                onChange={(optId) => onChange({ selectedOptionId: optId })}
                disabled={disabled}
                checkedFeedback={checkedFeedback}
              />
            );
          }
          case "FILL_IN_BLANK": {
            const activeText = (resolvedPayload?.textAnswer as string) ?? "";
            return (
              <FillBlankQuestion
                question={question}
                textAnswer={activeText}
                onChange={(txtVal) => onChange({ textAnswer: txtVal })}
                onEnterPress={onEnterPress}
                disabled={disabled}
                checkedFeedback={checkedFeedback}
              />
            );
          }
          case "FIND_AND_CORRECT":
            return (
              <FindAndCorrectQuestion
                question={question}
                payload={resolvedPayload}
                onChange={onChange}
                onEnterPress={onEnterPress}
                disabled={disabled}
                checkedFeedback={checkedFeedback}
              />
            );
          case "SENTENCE_REWRITE":
            return (
              <SentenceRewriteQuestion
                question={question}
                payload={resolvedPayload}
                onChange={onChange}
                onEnterPress={onEnterPress}
                disabled={disabled}
                checkedFeedback={checkedFeedback}
              />
            );
          default:
            return (
              <div className="p-6 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl font-medium">
                Unsupported question type: {question.type}.
              </div>
            );
        }
      })()}

      {checkedFeedback?.explanation && (
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 shadow-sm text-sm text-text-primary leading-relaxed space-y-2 mt-4 animate-slide-up">
          <h4 className="font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider text-xs">
            Explanation (Giải thích)
          </h4>
          <p className="text-text-secondary">{checkedFeedback.explanation}</p>
        </div>
      )}
    </div>
  );
}
export default QuestionRenderer;
