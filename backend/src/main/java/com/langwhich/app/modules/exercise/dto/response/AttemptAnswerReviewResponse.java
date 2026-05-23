package com.langwhich.app.modules.exercise.dto.response;

import com.langwhich.app.modules.exercise.entity.ExerciseAttemptAnswer;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptAnswerReviewResponse {
    private Long questionId;
    private Long selectedOptionId;
    private String textAnswer;
    private boolean isCorrect;
    private int pointsEarned;
    
    public static AttemptAnswerReviewResponse fromEntity(ExerciseAttemptAnswer answer) {
        if (answer == null) return null;
        return AttemptAnswerReviewResponse.builder()
            .questionId(answer.getQuestion().getId())
            .selectedOptionId(answer.getSelectedOption() != null ? answer.getSelectedOption().getId() : null)
            .textAnswer(answer.getTextAnswer())
            .isCorrect(answer.isCorrect())
            .pointsEarned(answer.getPointsEarned())
            .build();
    }
}
