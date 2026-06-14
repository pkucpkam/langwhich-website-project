package com.langwhich.app.modules.exercise.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import com.langwhich.app.modules.exercise.entity.ExerciseAttemptAnswer;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptAnswerReviewResponse {
    private Long questionId;
    private JsonNode payload;
    
    @com.fasterxml.jackson.annotation.JsonProperty("isCorrect")
    private boolean isCorrect;
    
    private int pointsEarned;
    private String feedback;
    private String explanation;
    
    public static AttemptAnswerReviewResponse fromEntity(ExerciseAttemptAnswer answer) {
        if (answer == null) return null;
        return AttemptAnswerReviewResponse.builder()
            .questionId(answer.getQuestion().getId())
            .payload(answer.getPayload())
            .isCorrect(answer.isCorrect())
            .pointsEarned(answer.getPointsEarned())
            .feedback(answer.getFeedback())
            .explanation(answer.getExplanation())
            .build();
    }
}
