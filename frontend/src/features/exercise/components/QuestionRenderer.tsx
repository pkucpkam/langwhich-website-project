import type { Question } from "../types";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { FillBlankQuestion } from "./FillBlankQuestion";

interface QuestionRendererProps {
  question: Question;
  selectedOptionId?: number | null;
  textAnswer?: string | null;
  onChange: (data: { selectedOptionId?: number | null; textAnswer?: string | null }) => void;
  disabled?: boolean;
}

export function QuestionRenderer({
  question,
  selectedOptionId,
  textAnswer,
  onChange,
  disabled = false,
}: QuestionRendererProps) {
  switch (question.type) {
    case "MULTIPLE_CHOICE":
      return (
        <MultipleChoiceQuestion
          question={question}
          selectedOptionId={selectedOptionId}
          onChange={(optId) => onChange({ selectedOptionId: optId, textAnswer: null })}
          disabled={disabled}
        />
      );
    case "FILL_IN_BLANK":
      return (
        <FillBlankQuestion
          question={question}
          textAnswer={textAnswer}
          onChange={(txtVal) => onChange({ selectedOptionId: null, textAnswer: txtVal })}
          disabled={disabled}
        />
      );
    default:
      return (
        <div className="p-6 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl font-medium">
          Unsupported question type: {question.type}. The Exercise Engine is designed to support this in a future update!
        </div>
      );
  }
}
export default QuestionRenderer;
