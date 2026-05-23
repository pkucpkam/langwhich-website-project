import type { Question } from "../types";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { FillBlankQuestion } from "./FillBlankQuestion";

interface QuestionRendererProps {
  question: Question;
  selectedOptionId?: number | null;
  textAnswer?: string | null;
  onChange: (data: { selectedOptionId?: number | null; textAnswer?: string | null }) => void;
  disabled?: boolean;
  checkedFeedback?: {
    isCorrect: boolean;
    explanation?: string | null;
    correctOptionId?: number | null;
    correctAnswers?: string[] | null;
  } | null;
}

export function QuestionRenderer({
  question,
  selectedOptionId,
  textAnswer,
  onChange,
  disabled = false,
  checkedFeedback = null,
}: QuestionRendererProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {(() => {
        switch (question.type) {
          case "MULTIPLE_CHOICE":
            return (
              <MultipleChoiceQuestion
                question={question}
                selectedOptionId={selectedOptionId}
                onChange={(optId) => onChange({ selectedOptionId: optId, textAnswer: null })}
                disabled={disabled}
                checkedFeedback={checkedFeedback}
              />
            );
          case "FILL_IN_BLANK":
            return (
              <FillBlankQuestion
                question={question}
                textAnswer={textAnswer}
                onChange={(txtVal) => onChange({ selectedOptionId: null, textAnswer: txtVal })}
                disabled={disabled}
                checkedFeedback={checkedFeedback}
              />
            );
          default:
            return (
              <div className="p-6 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl font-medium">
                Unsupported question type: {question.type}. The Exercise Engine is designed to support this in a future update!
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
