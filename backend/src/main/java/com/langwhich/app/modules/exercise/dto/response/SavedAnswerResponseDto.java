package com.langwhich.app.modules.exercise.dto.response;

import com.langwhich.app.modules.exercise.entity.ExerciseAttemptAnswer;
import com.langwhich.app.modules.exercise.entity.ExerciseType;
import com.langwhich.app.modules.exercise.entity.QuestionOption;
import com.langwhich.app.modules.exercise.entity.QuestionAnswer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedAnswerResponseDto {
    private Long questionId;
    private Long selectedOptionId;
    private String textAnswer;
    private Boolean isCorrect;
    private String explanation;
    private Long correctOptionId;
    private List<String> correctAnswers;

    public static SavedAnswerResponseDto fromEntity(ExerciseAttemptAnswer answer) {
        Long correctOptId = null;
        if (answer.getQuestion().getType() == ExerciseType.MULTIPLE_CHOICE) {
            correctOptId = answer.getQuestion().getOptions().stream()
                    .filter(QuestionOption::isCorrect)
                    .map(QuestionOption::getId)
                    .findFirst()
                    .orElse(null);
        }

        List<String> correctAnsws = null;
        if (answer.getQuestion().getType() == ExerciseType.FILL_IN_BLANK) {
            correctAnsws = answer.getQuestion().getAnswers().stream()
                    .map(QuestionAnswer::getCorrectAnswer)
                    .toList();
        }

        return SavedAnswerResponseDto.builder()
                .questionId(answer.getQuestion().getId())
                .selectedOptionId(answer.getSelectedOption() != null ? answer.getSelectedOption().getId() : null)
                .textAnswer(answer.getTextAnswer())
                .isCorrect(answer.isCorrect())
                .explanation(answer.getQuestion().getExplanation())
                .correctOptionId(correctOptId)
                .correctAnswers(correctAnsws)
                .build();
    }
}
